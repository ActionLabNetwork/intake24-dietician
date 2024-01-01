<template>
  <v-container>
    <div>
      <div>
        <h1 class="text heading">{{ t('surveys.addNewSurvey.title') }}</h1>
        <h3 class="text subheading">
          {{ t('surveys.addNewSurvey.subtitle') }}
        </h3>
      </div>
      <div class="mt-5">
        <v-btn
          color="primary text-none"
          class="mt-3 mt-sm-0"
          :disabled="false"
          type="submit"
          @click.prevent="handleSubmit"
        >
          {{ t('surveys.addNewSurvey.save') }}
        </v-btn>
      </div>
    </div>
    <v-divider class="my-10"></v-divider>
    <div>
      <p class="font-weight-medium">
        {{ t('surveys.addNewSurvey.surveyDetails.title') }}
      </p>
      <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
        <v-col>
          <div v-for="(config, fieldName) in formSurveyConfig" :key="fieldName">
            <div v-if="config.type === 'input'">
              <BaseInput
                :type="config.inputType"
                :name="config.key"
                :rules="config.rules"
                :autocomplete="config.autocomplete"
                :value="formValues[fieldName]"
                :suffix-icon="config.suffixIcon"
                :handle-icon-click="config.handleSuffixIconClick"
                :class="config.class"
                :required="config.required"
                @update="config.handleUpdate"
              >
                <span class="input-label">
                  {{ config.label }}
                </span>
                <span v-if="config.labelSuffix" class="input-label suffix">
                  {{ config.labelSuffix }}
                </span>
              </BaseInput>
            </div>
          </div>
        </v-col>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'
import { ref } from 'vue'
import type { Form } from '../profile/types'
import { useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import {
  SurveyCreateDto,
  SurveyCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'
// import { useSurveys } from '@intake24-dietician/portal/queries/useSurveys'

type FormField = keyof Omit<
  SurveyCreateDto,
  'isActive' | 'surveyPreference' | 'feedbackModules'
>

const props = defineProps<{
  defaultState: Omit<SurveyCreateDto, 'surveyPreference'>
  handleSubmit?: () => Promise<unknown>
  mode: 'Add' | 'Edit'
}>()
const emit = defineEmits<{
  update: [value: Omit<SurveyCreateDto, 'surveyPreference'>]
}>()

const { t } = useI18n<i18nOptions>()
const { mdAndUp } = useDisplay()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<Omit<SurveyCreateDto, 'surveyPreference'>>({
  ...props.defaultState,
})

const handleFieldUpdate = (fieldName: FormField, newVal: string) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const formSurveyConfig: Form<FormField> = {
  surveyName: {
    key: 'surveyName',
    label: t('surveys.addNewSurvey.surveyDetails.name'),
    required: true,
    labelSuffix: t('profile.form.personalDetails.firstName.labelSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.surveyName, value),
    ],
    handleUpdate: val => handleFieldUpdate('surveyName', val),
  },
  intake24SurveyId: {
    key: 'intake24SurveyId',
    label: 'Intake24 Survey ID',
    required: true,
    labelSuffix: ' (required)',
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.intake24SurveyId, value),
    ],
    handleUpdate: val => handleFieldUpdate('intake24SurveyId', val),
  },
  intake24Secret: {
    key: 'intake24Secret',
    label: 'Intake24 Secret',
    required: true,
    labelSuffix: ' (required)',
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.intake24Secret, value),
    ],
    handleUpdate: val => handleFieldUpdate('intake24Secret', val),
  },
  alias: {
    key: 'alias',
    label: t('surveys.addNewSurvey.surveyDetails.alias'),
    required: true,
    labelSuffix: ' (required)',
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.alias, value),
    ],
    handleUpdate: val => handleFieldUpdate('alias', val),
  },
  recallSubmissionURL: {
    key: 'recallSubmissionURL',
    label: 'Recall Submission URL',
    required: true,
    labelSuffix: ' (required)',
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.recallSubmissionURL, value),
    ],
    handleUpdate: val => handleFieldUpdate('recallSubmissionURL', val),
  },
}
</script>

<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
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
