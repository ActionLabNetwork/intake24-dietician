<template>
  <v-main class="wrapper">
    <v-container>
      <SteppedSurveyConfiguration
        v-if="secretGenerated"
        :default-state="surveyConfigFormValues"
        :handle-submit="handleSubmit"
        @update="handleSurveyConfigUpdate"
      />
      <!-- <SurveyConfiguration
        :default-state="surveyConfigFormValues"
        mode="Add"
        :handle-submit="handleSubmit"
        @update="handleSurveyConfigUpdate"
      /> -->
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

// import SurveyConfiguration from '@intake24-dietician/portal/components/surveys/SurveyConfiguration.vue'
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
import router from '@intake24-dietician/portal/router'
import {
  SurveyCreateDto,
  SurveyCreateDtoSchema,
  SurveyDto,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { useQueryClient } from '@tanstack/vue-query'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'

const $toast = useToast()
// const { t } = useI18n<i18nOptions>()

const clinicStore = useClinicStore()

const queryClient = useQueryClient()
const surveySecretMutation = useGenerateSurveySecret()
const surveyUUIDMutation = useGenerateSurveyUUID()
const addSurveyMutation = useAddSurvey()

const secretGenerated = ref(false)
const surveyConfigFormValues = ref<Omit<SurveyCreateDto, 'surveyPreference'>>({
  surveyName: '',
  intake24Host: 'https://myfoodswaps.com/api/recall/alias',
  intake24AdminBaseUrl: 'https://admin.intake24.dev',
  countryCode: 'au',
  intake24SurveyId: '',
  intake24Secret: '',
  alias: '',
  isActive: true,
})

const handleSurveyConfigUpdate = (
  values: Omit<SurveyCreateDto, 'surveyPreference'>,
) => {
  surveyConfigFormValues.value = values
}

const handleSubmit = async () => {
  return new Promise((resolve, reject) => {
    // Validate with zod
    const result = SurveyCreateDtoSchema.safeParse(surveyConfigFormValues.value)

    if (!result.success) {
      $toast.error(result.error.errors[0]?.message ?? DEFAULT_ERROR_MESSAGE)
      reject(new Error('Form validation failed'))
      return
    }

    addSurveyMutation.mutate(
      { survey: surveyConfigFormValues.value },
      {
        onSuccess: async surveyId => {
          $toast.success('Survey added to records')
          await queryClient.invalidateQueries({ queryKey: ['surveys'] })
          const allClinics = queryClient.getQueryData([
            'surveys',
          ]) as SurveyDto[]
          const newClinic = allClinics.find(clinic => clinic.id === surveyId)
          console.log({ newClinic })
          clinicStore.switchCurrentClinic(surveyId)
          resolve('Survey added to records')
          router.push({
            name: 'Survey Master Settings',
            params: { surveyId },
          })
        },
        onError: () => {
          $toast.error(DEFAULT_ERROR_MESSAGE)
        },
      },
    )
  })
}

onMounted(async () => {
  surveyConfigFormValues.value = {
    ...surveyConfigFormValues.value,
    intake24Secret: await surveySecretMutation.mutateAsync(),
    alias: await surveyUUIDMutation.mutateAsync(),
  }
  secretGenerated.value = true
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
