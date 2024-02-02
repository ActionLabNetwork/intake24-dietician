<template>
  <v-container>
    <div>
      <BackButton class="mb-5" />
      <div>
        <h1 class="text heading">{{ t('surveys.addNewSurvey.title') }}</h1>
        <h3 class="text subheading">
          {{ t('surveys.addNewSurvey.subtitle') }}
        </h3>
      </div>
      <v-divider class="my-10"></v-divider>
    </div>
    {{ nextDisabled }}
    <v-stepper v-model="currentStep">
      <template #default="{ prev, next }">
        <!-- Header -->
        <v-stepper-header>
          <template v-for="step in steps" :key="step.title">
            <v-stepper-item
              :complete="step.complete"
              :title="step.title"
              :value="step.value"
              color="primary"
            />
          </template>
        </v-stepper-header>

        <!-- Content -->
        <v-stepper-window>
          <v-form>
            <div
              :width="mdAndUp ? '100%' : '100%'"
              class="mt-5"
              style="background: inherit; border: 0"
            >
              <v-stepper-window-item
                v-for="step in steps"
                :key="`${step.title}-content`"
                :value="step.value"
              >
                <v-card>
                  <div v-for="field in step.formFields" :key="field + '-input'">
                    <VBaseInput
                      v-if="formSurveyConfig[field].type === 'input'"
                      :name="formSurveyConfig[field].key"
                      :type="formSurveyConfig[field].type"
                      :required="formSurveyConfig[field].required"
                      :rules="formSurveyConfig[field].rules"
                      :autocomplete="formSurveyConfig[field].autocomplete"
                      :value="formValues[field]"
                      bordered
                      :suffix-icon="formSurveyConfig[field].suffixIcon"
                      :handle-icon-click="
                        formSurveyConfig[field].handleSuffixIconClick
                      "
                      :class="formSurveyConfig[field].class"
                      @update="formSurveyConfig[field].handleUpdate"
                    >
                      <div>
                        <span class="input-label">
                          {{ formSurveyConfig[field].label }}
                        </span>
                        <span
                          v-if="formSurveyConfig[field].labelSuffix"
                          class="input-label suffix"
                        >
                          {{ formSurveyConfig[field].labelSuffix }}
                        </span>
                      </div>
                      <div class="input-label description">
                        {{ formSurveyConfig[field].description }}
                      </div>
                    </VBaseInput>
                  </div>
                </v-card>
              </v-stepper-window-item>
            </div>
          </v-form>
        </v-stepper-window>

        <!-- Action -->
        <v-stepper-actions>
          <template #prev>
            <v-btn
              @click="
                () => {
                  steps[currentStep > 0 ? currentStep - 1 : 0]?.onPrevClicked?.(
                    prev,
                  )
                }
              "
            >
              {{ steps[currentStep > 0 ? currentStep - 1 : 0]?.prevText }}
            </v-btn>
          </template>
          <template #next>
            <v-btn
              :disabled="nextDisabled"
              @click="
                () => {
                  steps[currentStep > 0 ? currentStep - 1 : 0]?.onNextClicked?.(
                    next,
                  )
                }
              "
            >
              {{ steps[currentStep > 0 ? currentStep - 1 : 0]?.nextText }}
            </v-btn>
          </template>
        </v-stepper-actions>
      </template>
    </v-stepper>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VBaseInput from '../form/VBaseInput.vue'
import BackButton from '../common/BackButton.vue'
import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import {
  SurveyCreateDto,
  SurveyCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import type { Form } from '../profile/types'

type FormField = keyof Omit<
  SurveyCreateDto,
  'isActive' | 'surveyPreference' | 'feedbackModules'
>
type Step = {
  title: string
  value: string
  complete: boolean
  subtitle: string
  formFields: FormField[]
  prevText?: string
  nextText: string
  onPrevClicked?: (prev: any) => void
  onNextClicked: (next: any) => void
}
const { mdAndUp } = useDisplay()
const { t } = useI18n<i18nOptions>()

const props = defineProps<{
  defaultState: Omit<SurveyCreateDto, 'surveyPreference'>
  handleSubmit?: () => Promise<unknown>
}>()

const emit = defineEmits<{
  update: [value: Omit<SurveyCreateDto, 'surveyPreference'>]
}>()

const formSurveyConfig: Form<FormField> = {
  surveyName: {
    key: 'surveyName',
    label: t('surveys.addNewSurvey.surveyDetails.name.label'),
    description: t('surveys.addNewSurvey.surveyDetails.name.description'),
    required: true,
    labelSuffix: t('profile.form.personalDetails.firstName.labelSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.surveyName, value),
    ],
    handleUpdate: val => {
      handleFieldUpdate('surveyName', val)
    },
  },
  intake24SurveyId: {
    key: 'intake24SurveyId',
    label: t('surveys.addNewSurvey.surveyDetails.intake24SurveyId.label'),
    description: t(
      'surveys.addNewSurvey.surveyDetails.intake24SurveyId.description',
    ),
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
  intake24Host: {
    key: 'intake24SurveyHost',
    label: t('surveys.addNewSurvey.surveyDetails.intake24SurveyHost.label'),
    description: t(
      'surveys.addNewSurvey.surveyDetails.intake24SurveyHost.description',
    ),
    required: true,
    labelSuffix: t('general.form.requiredSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.intake24Host, value),
    ],
    handleUpdate: val => handleFieldUpdate('intake24Host', val),
  },
  intake24Secret: {
    key: 'intake24Secret',
    label: t('surveys.addNewSurvey.surveyDetails.intake24Secret.label'),
    description: t(
      'surveys.addNewSurvey.surveyDetails.intake24Secret.description',
    ),
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
    label: t('surveys.addNewSurvey.surveyDetails.alias.label'),
    description: t('surveys.addNewSurvey.surveyDetails.alias.description'),
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
}

const currentStep = ref(0)

// TODO: Replace this when the i18n is setup
const steps = ref<Step[]>([
  {
    title: 'Clinic Name',
    value: '1',
    complete: false,
    subtitle:
      'Your practise, your space. Create and tailor the new clinic according to your work needs',
    formFields: ['surveyName'],
    nextText: 'Contine with setup',
    onNextClicked: (next: any) => {
      next()
    },
  },
  {
    title: 'System setup',
    value: '2',
    complete: false,
    subtitle:
      'Your practise, your space. Create and tailor the new clinic according to your work needs',
    formFields: ['intake24Host', 'intake24SurveyId'],
    prevText: 'Go Back',
    nextText: 'Contine with clinic setup',
    onPrevClicked: (prev: any) => {
      prev()
    },
    onNextClicked: (next: any) => {
      next()
    },
  },
  {
    title: 'Clinic setup',
    value: '3',
    complete: false,
    subtitle:
      'Your practise, your space. Create and tailor the new clinic according to your work needs',
    formFields: ['intake24Secret', 'alias'],
    prevText: 'Go Back',
    nextText: 'Save and continue',
    onPrevClicked: (prev: any) => {
      prev()
    },
    onNextClicked: () => {
      props.handleSubmit?.()
    },
  },
])

const formValues = ref<Omit<SurveyCreateDto, 'surveyPreference'>>({
  ...props.defaultState,
})

const handleFieldUpdate = (fieldName: FormField, newVal: string) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const nextDisabled = computed(
  () =>
    !steps.value[
      currentStep.value > 0 ? currentStep.value - 1 : 0
    ]?.formFields.every(field =>
      formSurveyConfig[field].rules?.some(
        rule => rule(formValues.value[field]) === true,
      ),
    ),
)
</script>

<style scoped lang="scss">
.input-label {
  font-size: 1.01rem;

  &.description {
    color: #555555;
    font-size: 0.85rem;
  }
  &.suffix {
    color: #ee672d;
    font-size: 0.95rem;
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
