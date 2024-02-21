<template>
  <VOnboardingWrapper
    ref="wrapper"
    :steps="steps"
    :options="{
      overlay: {
        enabled: false,
      },
    }"
  >
    <template #default="{ previous, next, step, isLast, index }">
      <VOnboardingStep v-if="step && step.content">
        <OnboardingBubble
          :title="step.content.title"
          :description="step.content.description"
          :is-last="isLast"
          :num-steps="steps.length"
          :index="index"
          :placement="step.options?.popper?.placement ?? 'bottom'"
          @previous="previous"
          @next="next"
          @finish="finishOnboarding"
        />
      </VOnboardingStep>
    </template>
  </VOnboardingWrapper>

  <v-dialog v-model="showWelcomeDialog" persistent :max-width="420">
    <template #default>
      <ClinicIntroduction
        @next="
          () => {
            onBoardingStarted = true
            showWelcomeDialog = false
            start()
          }
        "
        @skip="() => finishOnboarding()"
      />
    </template>
  </v-dialog>
  <v-main>
    <v-row class="ml-1">
      <SurveyClinicDetails v-if="!hideSurveyDetails" />
    </v-row>
    <v-row>
      <v-col cols="12" md="12" class="pa-0 ma-0">
        <router-view />
      </v-col>
    </v-row>
  </v-main>
</template>

<script lang="ts" setup>
import OnboardingBubble from '@/components/common/OnboardingBubble.vue'
import ClinicIntroduction from '@/components/surveys/ClinicIntroduction.vue'
import SurveyClinicDetails from '@/components/surveys/SurveyClinicDetails.vue'
import { useUpdateProfile } from '@intake24-dietician/portal/mutations/useAuth'
import { useProfile } from '@intake24-dietician/portal/queries/useAuth'
import { useIntercomponentControlStore } from '@intake24-dietician/portal/stores/intercomponentControl'
import {
  VOnboardingStep,
  VOnboardingWrapper,
  useVOnboarding,
} from 'v-onboarding'
import { computed, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import 'vue-toast-notification/dist/theme-sugar.css'

const route = useRoute()

const intercomponentControlStore = useIntercomponentControlStore()

const showWelcomeDialog = ref(false)
const wrapper = ref(null)
const { start, goToStep, finish } = useVOnboarding(wrapper)
const overlay = {
  enabled: true,
  padding: 10,
  borderRadius: 4,
  preventOverlayInteraction: true,
}
const steps = [
  {
    attachTo: {
      element: '#patient-list',
    },
    options: {
      popper: {
        placement: 'bottom',
      },
      overlay,
    },
    content: {
      title: 'Patient list',
      description:
        'View patient records to review their recall, give feedback or edit patient profile. You can also check the recall and feedback history and quickly send recall completion reminders from the patient list table.',
    },
    on: {
      afterStep: ({ isBackward }: { isBackward: boolean }) => {
        if (isBackward) showWelcomeDialog.value = true
      },
    },
  },
  {
    attachTo: {
      element: '#clinic-menu',
    },
    content: {
      title: 'Clinics',
      description:
        'Select the clinic tab to quickly navigate between your clinics. You can also create a new clinic from here.',
    },
    on: {
      beforeStep: () => {
        intercomponentControlStore.setClinicMenuOpen(true)
      },
      afterStep: () => {
        intercomponentControlStore.setClinicMenuOpen(false)
      },
    },
    options: {
      popper: {
        placement: 'right',
      },
      overlay,
    },
  },
  {
    attachTo: {
      element: '#clinic-settings-btn',
    },
    content: {
      title: 'Clinic settings',
      description:
        'Select the settings button If you want to make changes in your clinic’s setup.',
    },
    options: {
      popper: {
        placement: 'left',
      },
      overlay,
    },
  },
  {
    attachTo: {
      element: '#add-patient-btn',
    },
    content: {
      title: 'Adding a new patient',
      description:
        'You can easily add a new patient to a clinic by clicking this button. Do note, the new patient will always get added to the selected clinic only.',
    },
    options: {
      popper: {
        placement: 'left',
      },
      overlay,
    },
  },
]

const { data: profile } = useProfile()
const { mutate } = useUpdateProfile()

// v-onboarding does not have a hook to keep track of this,
// so we create our own to prevent the watchEffect below from firing again.
const onBoardingStarted = ref(false)

watchEffect(() => {
  if (!profile.value) return
  if (!profile.value.onboardingFinished && !onBoardingStarted.value) {
    showWelcomeDialog.value = true
    // onBoardingStarted.value = true
    // start()
  }
})

const finishOnboarding = () => {
  if (!profile.value) return
  mutate({
    emailAddress: profile.value.user.email,
    dieticianProfile: { onboardingFinished: true },
  })
  finish()
  showWelcomeDialog.value = false
}

const hideSurveyDetails = computed(() => {
  const routeNames = [
    'Survey Master Settings',
    'Survey Patient Compose New Feedback',
    'Survey Patient Edit Draft Feedback',
  ]
  return routeNames.includes(route.name as string)
})
</script>

<style scoped lang="scss">
.wrapper {
  background: rgb(252, 249, 244);
  background: -moz-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: -webkit-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#fcf9f4",endColorstr="#ffffff",GradientType=1);
}

@media print {
  .wrapper {
    background: white;
  }
}
</style>
