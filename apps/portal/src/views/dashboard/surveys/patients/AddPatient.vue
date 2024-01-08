<template>
  <div v-if="surveyQuery.isPending.value">
    <BaseProgressCircularVue />
  </div>
  <div v-else-if="surveyQuery.isError.value">
    <!-- TODO: Create an error page  -->
    Error page
  </div>
  <div v-else class="wrapper">
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center mt-12"
      >
        <div>
          <h1 class="text heading">New patient information</h1>
        </div>
        <div>
          <BaseButton
            class="mt-3 mt-sm-0"
            :disabled="!isFormValid"
            type="submit"
            @click.prevent="handleSubmit"
          >
            Add patient to records
          </BaseButton>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form ref="form">
        <div>
          <ContactDetails
            :default-state="contactDetailsFormValues"
            mode="Add"
            @update="handleContactDetailsUpdate"
          />
          <PersonalDetails
            :default-state="personalDetailsFormValues"
            class="mt-16"
            @update="handlePersonalDetailsUpdate"
          />
          <VisualThemeSelector
            :default-state="theme"
            class="mt-10"
            @update="handleVisualThemeUpdate"
          />
          <SendAutomatedFeedbackToggle
            :default-state="sendAutomatedFeedback"
            class="mt-10"
            @update="handleSendAutomatedFeedback"
          />
          <UpdateRecallFrequency
            :default-state="recallFrequency"
            class="mt-10"
            @update="handleRecallFrequencyUpdate"
          />
        </div>
        <div>
          <p class="font-weight-medium">
            Review and add new patient to the records
          </p>
          <v-btn
            color="primary"
            class="text-none mt-4"
            type="submit"
            :disabled="!isFormValid"
            @click.prevent="handleSubmit"
          >
            Add patient to records
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import ContactDetails, {
  ContactDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import PersonalDetails from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import { PersonalDetailsFormValues } from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import UpdateRecallFrequency from '@intake24-dietician/portal/components/patients/patient-details/UpdateRecallFrequency.vue'
import { Theme } from '@intake24-dietician/common/types/theme'
import { useAddPatient } from '@intake24-dietician/portal/mutations/usePatients'
import { useToast } from 'vue-toast-notification'
import { DEFAULT_ERROR_MESSAGE } from '@/constants/index'
import router from '@intake24-dietician/portal/router'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
import { useRoute } from 'vue-router'
import { PatientUpdateDtoSchema } from '@intake24-dietician/common/entities-new/user.dto'
import BaseButton from '@intake24-dietician/portal/components/common/BaseButton.vue'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
// const { t } = useI18n<i18nOptions>()

const route = useRoute()

const $toast = useToast()

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const addPatientMutation = useAddPatient()

const form = ref()

// Default values
const defaultContactDetailsFormValues: ContactDetailsFormValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  avatar: '',
  mobileNumber: '',
  email: '',
  address: '',
}
const defaultPersonalDetailsFormValues: PersonalDetailsFormValues = {
  age: 20,
  gender: 'Male',
  weight: 70,
  height: 170,
  additionalNotes: '',
  patientGoal: '',
}
const defaultTheme: Theme = 'Classic'
const defaultSendAutomatedFeedback = false
const defaultRecallFrequency: ReminderCondition = {
  reminderEvery: {
    every: 5,
    unit: 'days',
  },
  reminderEnds: {
    type: 'never',
  },
}

const contactDetailsFormValues = ref<ContactDetailsFormValues>(
  defaultContactDetailsFormValues,
)
const personalDetailsFormValues = ref<PersonalDetailsFormValues>(
  defaultPersonalDetailsFormValues,
)
const theme = ref<Theme>(defaultTheme)
const sendAutomatedFeedback = ref<boolean>(defaultSendAutomatedFeedback)
const recallFrequency = ref<ReminderCondition>(defaultRecallFrequency)

const aggregatedData = computed(() => ({
  ...contactDetailsFormValues.value,
  ...personalDetailsFormValues.value,
  additionalDetails: null,
  theme: theme.value,
  sendAutomatedFeedback: sendAutomatedFeedback.value,
  recallFrequency: recallFrequency.value,
  isArchived: false,
}))

const isFormValid = computed(() => {
  // TODO: Add proper zod validation
  return true
})

const handleContactDetailsUpdate = (values: ContactDetailsFormValues) => {
  contactDetailsFormValues.value = values
}

const handlePersonalDetailsUpdate = (values: PersonalDetailsFormValues) => {
  personalDetailsFormValues.value = values
}

const handleVisualThemeUpdate = (_theme: Theme) => {
  theme.value = _theme
}

const handleSendAutomatedFeedback = (value: boolean) => {
  sendAutomatedFeedback.value = value
}

const handleRecallFrequencyUpdate = (value: ReminderCondition) => {
  recallFrequency.value = value
}

const handleSubmit = async () => {
  return new Promise((resolve, reject) => {
    // Validate with zod
    const result = PatientUpdateDtoSchema.safeParse(aggregatedData.value)

    if (!result.success) {
      $toast.error(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
      reject(new Error('Form validation failed'))
      return
    }

    // Validate with Vuetify
    const errors = form.value.errors
    if (errors.length > 0) {
      reject(new Error('Form validation failed'))
      return
    }

    addPatientMutation.mutate(
      {
        surveyId: (route.params['surveyId'] as string) ?? '',
        email: aggregatedData.value.email,
        patient: aggregatedData.value,
      },
      {
        onSuccess: () => {
          $toast.success('Patient added to records')
          resolve('Patient added to records')
          router.push({
            name: 'Survey Patient List',
            params: { surveyId: route.params['surveyId'] as string },
          })
        },
        onError: () => {
          $toast.error(DEFAULT_ERROR_MESSAGE)
        },
      },
    )
  })
}

watch(
  () => surveyQuery.data.value,
  survey => {
    theme.value = survey?.surveyPreference.theme ?? defaultTheme
    sendAutomatedFeedback.value =
      survey?.surveyPreference.sendAutomatedFeedback ??
      defaultSendAutomatedFeedback
    recallFrequency.value =
      survey?.surveyPreference.reminderCondition ?? defaultRecallFrequency
  },
)
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
.text {
  max-width: 100%;
  padding-bottom: 0.5rem;

  &.heading {
    color: #000;
    font-family: Roboto;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  &.subheading {
    color: #555;
    font-family: Roboto;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
  }
}
</style>
