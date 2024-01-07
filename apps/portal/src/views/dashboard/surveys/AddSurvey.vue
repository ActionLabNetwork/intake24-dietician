<template>
  <v-main class="wrapper">
    <v-container>
      <SurveyConfiguration
        :default-state="surveyConfigFormValues"
        mode="Add"
        :handle-submit="handleSubmit"
        @update="handleSurveyConfigUpdate"
      />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import SurveyConfiguration from '@intake24-dietician/portal/components/surveys/SurveyConfiguration.vue'
// import { useI18n } from 'vue-i18n'
// import type { i18nOptions } from '@intake24-dietician/i18n'
import { useAddSurvey } from '@intake24-dietician/portal/mutations/useSurvey'
import { DEFAULT_ERROR_MESSAGE } from '@intake24-dietician/portal/constants'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import router from '@intake24-dietician/portal/router'
import {
  SurveyCreateDto,
  SurveyCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'

const $toast = useToast()
// const { t } = useI18n<i18nOptions>()

const addSurveyMutation = useAddSurvey()

const surveyConfigFormValues = ref<Omit<SurveyCreateDto, 'surveyPreference'>>({
  surveyName: '',
  intake24SurveyId: '',
  intake24Secret: '',
  alias: '',
  recallSubmissionURL: '',
  isActive: true,
})

const handleSurveyConfigUpdate = (
  values: Omit<SurveyCreateDto, 'surveyPreference'>,
) => {
  surveyConfigFormValues.value = values
}

const handleSubmit = async () => {
  return new Promise((resolve, reject) => {
    console.log('surveyConfigFormValues', surveyConfigFormValues.value)
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
        onSuccess: () => {
          $toast.success('Survey added to records')
          resolve('Survey added to records')
          router.push('/dashboard/my-surveys')
        },
        onError: () => {
          $toast.error(DEFAULT_ERROR_MESSAGE)
        },
      },
    )
  })
}
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
