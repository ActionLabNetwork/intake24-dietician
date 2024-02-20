<template>
  <v-container fluid class="px-10">
    <div v-if="!!surveyQuery.data.value" class="ma-0 pa-0">
      <BackButton class="mb-5" />
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center"
      >
        <div>
          <h1 class="text heading">
            Clinic setup for {{ clinicStore.currentClinic?.surveyName }}
          </h1>
          <h3 class="text subheading">
            Personalise your patient experience by choosing a visual theme,
            select and tailor feedback modules to suit your preferences. Set a
            default recall frequency to gather timely recall data, and customise
            notification preferences for real-time updates when patients
            complete their recall.
          </h3>
        </div>
        <div class="alert-text">
          <div v-if="formHasChanged" class="d-flex align-center">
            <div>
              <v-icon icon="mdi-alert-outline" size="large" start />
            </div>
            <div>
              There are changes made in master module setup, review and confirm
              changes before proceeding!
            </div>
          </div>
          <div class="align-self-center">
            <v-btn
              color="primary text-none"
              class="mt-3 mt-sm-0"
              type="submit"
              :disabled="!formHasChanged"
              :loading="updateSurveyPreferencesMutation.isPending.value"
              @click.prevent="handleSubmit"
            >
              Review and confirm changes
            </v-btn>
          </div>
        </div>
      </div>
      <v-divider class="my-10" />
      <FeedbackModules
        :default-state="surveyQuery.data.value"
        :submit="handleSubmit"
        @update="handleFeedbackModulesUpdate"
      />
      <RecallReminders
        v-if="recallReminderProps"
        :default-state="recallReminderProps"
        @update="handleRecallRemindersUpdate"
      />
      <div class="mt-10 ml-4">
        <p class="font-weight-medium">Review and save changes</p>
        <div v-if="formHasChanged" class="text subheading">
          You have made changes to the master module setup. Review and confirm
          the changes before you proceed with adding patients or reviewing
          recall feedback
        </div>
        <v-btn
          color="primary"
          class="text-none mt-4"
          :disabled="!formHasChanged"
          :loading="updateSurveyPreferencesMutation.isPending.value"
          @click="handleSubmit"
        >
          Review and confirm changes
        </v-btn>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import FeedbackModules from '@intake24-dietician/portal/components/master-settings/FeedbackModules.vue'
import RecallReminders from '@intake24-dietician/portal/components/master-settings/RecallReminders.vue'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
// import { RecallFrequencyDTO } from '@intake24-dietician/common/entities/recall-frequency.dto'
import {
  useUpdateSurvey,
  useUpdateSurveyPreferences,
} from '@intake24-dietician/portal/mutations/useSurvey'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DEFAULT_ERROR_MESSAGE } from '@intake24-dietician/portal/constants'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
import {
  SurveyDto,
  SurveyDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'
import { useForm } from 'vee-validate'

const clinicStore = useClinicStore()

const $toast = useToast()
const route = useRoute()
const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const updateSurveyMutation = useUpdateSurvey()
const updateSurveyPreferencesMutation = useUpdateSurveyPreferences()

const { values, resetForm } = useForm({ validationSchema: SurveyDtoSchema })

const initialFormData = ref<SurveyDto>()
const formData = ref<SurveyDto>()

const surveyConfigFormValues = ref<Omit<SurveyDto, 'surveyPreference'>>({
  id: 0,
  surveyName: '',
  intake24Host: '',
  countryCode: '',
  intake24SurveyId: '',
  intake24Secret: '',
  alias: '',
  isActive: true,
  feedbackModules: [],
})

const surveyQueryData = computed(() => {
  return surveyQuery.data.value
})

const recallReminderProps = computed(() => {
  const surveyPreference = surveyQuery.data.value?.surveyPreference

  if (
    surveyPreference?.reminderCondition &&
    surveyPreference?.reminderMessage !== undefined
  ) {
    return {
      reminderCondition: surveyPreference.reminderCondition,
      reminderMessage: surveyPreference.reminderMessage,
    }
  }

  return undefined
})

const formHasChanged = computed(() => {
  return (
    JSON.stringify(initialFormData.value) !== JSON.stringify(formData.value)
  )
})

const handleFeedbackModulesUpdate = (value: SurveyDto) => {
  if (!formData.value || !value) {
    return
  }
  formData.value = { ...formData.value, ...value }
}

const handleRecallRemindersUpdate = (value: {
  reminderCondition: ReminderCondition
  reminderMessage: string
}) => {
  if (!formData.value) {
    return
  }

  formData.value = {
    ...formData.value,
    surveyPreference: {
      ...formData.value.surveyPreference,
      reminderCondition: value.reminderCondition,
      reminderMessage: value.reminderMessage,
    },
  }
}

const handleSubmit = async (): Promise<void> => {
  if (!formData.value) {
    $toast.error('No data to submit')
    return
  }

  const uniqueFeedbackModules = formData.value.feedbackModules.filter(
    module =>
      !initialFormData.value?.feedbackModules.some(
        initialModule =>
          JSON.stringify(initialModule) === JSON.stringify(module),
      ),
  )

  // This is so that we're not updating the feedback modules if there are no changes
  formData.value.feedbackModules = uniqueFeedbackModules

  const { id, ...survey } = formData.value
  updateSurveyPreferencesMutation.mutate(
    { id, survey },
    {
      onSuccess: () => {
        $toast.success('Clinic preferences have been updated')
        initialFormData.value = formData.value
      },
      onError: error => {
        console.log({ error })
        $toast.error(DEFAULT_ERROR_MESSAGE)
      },
    },
  )

  resetForm({ values: formData.value })
}

watch(
  surveyQueryData,
  newSurveyQueryData => {
    if (!initialFormData.value) {
      initialFormData.value = newSurveyQueryData
    }

    // Prefill clinic details
    surveyConfigFormValues.value = {
      id: newSurveyQueryData?.id ?? 0,
      surveyName: newSurveyQueryData?.surveyName ?? '',
      intake24Host: newSurveyQueryData?.intake24Host ?? '',
      countryCode: newSurveyQueryData?.countryCode ?? '',
      intake24SurveyId: newSurveyQueryData?.intake24SurveyId ?? '',
      intake24Secret: newSurveyQueryData?.intake24Secret ?? '',
      alias: newSurveyQueryData?.alias ?? '',
      isActive: newSurveyQueryData?.isActive ?? true,
      feedbackModules: newSurveyQueryData?.feedbackModules ?? [],
    }

    // Prefill clinic preferences details
    if (!newSurveyQueryData?.surveyPreference) return
    formData.value = newSurveyQueryData
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.text {
  max-width: 100%;
  padding-bottom: 0.5rem;
  font-family: Roboto;
  font-style: normal;
  line-height: normal;

  &.heading {
    color: #000;
    font-size: 24px;
    font-weight: 600;
  }

  &.subheading {
    color: #555;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
    max-width: 40vw;
  }

  &.section-heading {
    color: #000;
    font-size: 18px;
    font-weight: 600;
  }

  &.section-heading-2 {
    color: #000;
    font-size: 16px;
    font-weight: 500;
  }

  &.section-subheading {
    color: #555;
    font-size: 14px;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
  }
}
.alert-text {
  display: flex;
  flex-direction: column;
  max-width: 30vw;
  gap: 0.5rem;
}
</style>
