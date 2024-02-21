<template>
  <v-main class="wrapper">
    <v-container fluid>
      <SteppedSurveyConfiguration
        v-if="renderChild"
        :default-state="surveyConfigFormValues"
        :handle-submit="handleSubmit"
        @update="handleSurveyConfigUpdate"
      />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import SteppedSurveyConfiguration from '@intake24-dietician/portal/components/surveys/SteppedSurveyConfiguration.vue'
// import { useI18n } from 'vue-i18n'
// import type { i18nOptions } from '@intake24-dietician/i18n'
import {
  useAddSurvey,
  useGenerateSurveySecret,
  useGenerateSurveyUUID,
} from '@intake24-dietician/portal/mutations/useSurvey'
import { DEFAULT_ERROR_MESSAGE } from '@intake24-dietician/portal/constants'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import {
  SurveyCreateDto,
  SurveyCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { useQueryClient } from '@tanstack/vue-query'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'
import { useFeedbackModules } from '@intake24-dietician/portal/queries/UseFeedbackModule'
import { allowedIntake24Hosts } from '@intake24-dietician/portal/constants/integration'

const $toast = useToast()
// const { t } = useI18n<i18nOptions>()

const clinicStore = useClinicStore()

const queryClient = useQueryClient()
const feedbackModulesQuery = useFeedbackModules()
const surveySecretMutation = useGenerateSurveySecret()
const surveyUUIDMutation = useGenerateSurveyUUID()
const addSurveyMutation = useAddSurvey()

const renderChild = ref(false)
const surveyConfigFormValues = ref<SurveyCreateDto>({
  surveyName: '',
  intake24Host: allowedIntake24Hosts[0],
  countryCode: 'au',
  intake24SurveyId: '',
  intake24Secret: '',
  alias: '',
  isActive: true,
  surveyPreference: {
    theme: 'Classic',
    reminderCondition: {
      reminderEvery: {
        every: 5,
        unit: 'days',
      },
      reminderEnds: { type: 'never' },
    },
    reminderMessage: '',
    sendAutomatedFeedback: true,
    notifySMS: false,
    notifyEmail: true,
  },
  feedbackModules: [],
})

const handleSurveyConfigUpdate = (values: SurveyCreateDto) => {
  surveyConfigFormValues.value = values
}

const handleSubmit = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const result = SurveyCreateDtoSchema.safeParse(surveyConfigFormValues.value)

    if (!result.success) {
      $toast.error(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
      reject(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
      return
    }

    addSurveyMutation.mutate(
      { survey: surveyConfigFormValues.value },
      {
        onSuccess: async surveyId => {
          $toast.success('Survey added to records')
          await queryClient.invalidateQueries({ queryKey: ['surveys'] })
          clinicStore.switchCurrentClinic(surveyId)
          resolve()
          clinicStore.navigateToSurveyPatientList()
        },
        onError: () => {
          $toast.error(DEFAULT_ERROR_MESSAGE)
          reject(DEFAULT_ERROR_MESSAGE)
        },
      },
    )
  })
}

watch(
  () => feedbackModulesQuery.data.value,
  async newFeedbackModules => {
    if (!newFeedbackModules) return

    const alias = await surveyUUIDMutation.mutateAsync()
    surveyConfigFormValues.value = {
      ...surveyConfigFormValues.value,
      intake24Host: allowedIntake24Hosts[0],
      intake24Secret: await surveySecretMutation.mutateAsync(),
      alias: alias,
      feedbackModules:
        newFeedbackModules.map(module => ({
          feedbackModuleId: module.id,
          name: module.name,
          description: module.description,
          isActive: true,
          feedbackAboveRecommendedLevel: '',
          feedbackBelowRecommendedLevel: '',
          nutrientTypes: module.nutrientTypes.map(nutrient => ({
            id: nutrient.id,
            description: '',
            unit: {
              description: '',
              symbol: '',
            },
          })),
        })) ?? [],
    }
    renderChild.value = true
  },
  { immediate: true },
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
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  &.subheading {
    color: #555;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 140%; /* 19.6px */
    letter-spacing: 0.14px;
  }
}
</style>
@intake24-dietician/portal/queries/useFeedbackModule
