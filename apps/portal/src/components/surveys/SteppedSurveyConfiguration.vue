<template>
  <v-container>
    <!-- <pre>{{ formValues }}</pre> -->
    <div class="mb-5">
      <BackButton class="mb-5" @click="onBackButtonClick" />
      <div>
        <h1 class="text heading">{{ steps[currentStep - 1]?.heading }}</h1>
        <h3 class="text subheading">
          {{ steps[currentStep - 1]?.subheading }}
        </h3>
      </div>
    </div>
    <v-stepper v-model="currentStep">
      <v-stepper-header>
        <template v-for="(step, i) in steps" :key="step.heading">
          <v-stepper-item
            :title="step.title"
            :value="i + 1"
            :complete="currentStep > i + 1"
            color="primary"
          />
          <v-divider v-if="i < steps.length - 1"></v-divider>
        </template>
      </v-stepper-header>

      <v-stepper-window>
        <v-form>
          <v-stepper-window-item
            v-for="(step, i) in steps"
            :key="step.heading"
            :value="i + 1"
          >
            <!-- <pre>{{ step }}</pre> -->
            <div
              v-for="(subStep, subStepIndex) in step.subSteps"
              :key="subStepIndex + 'substep'"
              class="mt-10"
            >
              <!-- <pre>{{ subStep }}</pre> -->
              <template v-if="subStep.stepName">
                <h1 class="text heading">
                  {{ subStep.stepName }}
                </h1>
                <h3 class="text subheading">
                  {{ subStep.description }}
                </h3>
              </template>
              <div v-for="field in subStep.fields" :key="field.key">
                <template v-if="field.type === 'input'">
                  <!-- <pre>{{ field.label }}</pre> -->
                  <VBaseInput
                    :name="field.key"
                    :type="field.inputType"
                    :readonly="field.readonly"
                    :placeholder="field.placeHolder"
                    :rules="field.rules"
                    :required="field.required"
                    :value="formValues[field.key]"
                    :select-config="field.selectConfig"
                    @update="field.handleUpdate"
                  >
                    <div>
                      <span class="input-label">
                        {{ field.label }}
                      </span>
                      <span v-if="field.labelSuffix" class="input-label suffix">
                        {{ field.labelSuffix }}
                      </span>
                      <v-btn
                        v-if="field.information"
                        icon="mdi-information-outline"
                        variant="text"
                        size="small"
                      >
                      </v-btn>
                    </div>
                    <div class="input-label description">
                      {{ field.description }}
                    </div>

                    <template #append>
                      <template
                        v-if="
                          field.key === 'intake24Secret' ||
                          field.key === 'intake24Host'
                        "
                      >
                        <v-btn
                          v-if="field.quickAction?.append"
                          color="primary"
                          @click="
                            () =>
                              field.quickAction?.append?.action(
                                formValues[field.key],
                              )
                          "
                        >
                          {{ field.quickAction.append.label }}
                        </v-btn>
                      </template>
                      <template v-if="field.key === 'countryCode'">
                        {{ field.placeHolder + formValues[field.key] }}
                      </template>
                    </template>

                    <template #append-inner>
                      <template v-if="field.key === 'countryCode'">
                        {{ formValues[field.key] }}
                      </template>
                    </template>
                  </VBaseInput>
                </template>
              </div>
            </div>
          </v-stepper-window-item>
        </v-form>
      </v-stepper-window>

      <v-stepper-actions style="justify-content: flex-start" disabled="false">
        <template #prev>
          <v-btn
            v-if="steps[currentStep - 1]?.prev"
            class="text-capitalize mr-5"
            variant="outlined"
            color="black"
            @click="steps[currentStep - 1]?.prev?.action"
            >{{ steps[currentStep - 1]?.prev?.label }}</v-btn
          >
        </template>

        <template #next>
          <v-btn
            class="text-capitalize"
            :disabled="isNextdisabled"
            variant="flat"
            color="primary"
            @click="steps[currentStep - 1]?.next.action"
            >{{ steps[currentStep - 1]?.next.label }}</v-btn
          >
        </template>
      </v-stepper-actions>
    </v-stepper>
    <BaseDialog
      v-model="isDialogActive"
      :on-confirm="onDialogConfirm"
      :on-cancel="onDialogCancel"
    >
      <template #title>{{ dialogTitle }}</template>
      {{ dialogDescription }}
    </BaseDialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackButton from '../common/BackButton.vue'
import VBaseInput from '../form/VBaseInput.vue'
import BaseDialog from '../common/BaseDialog.vue'
import {
  SurveyCreateDto,
  SurveyCreateDtoSchema,
  countryCodes,
} from '@intake24-dietician/common/entities-new/survey.dto'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import { computed } from 'vue'

type FormField = keyof Omit<
  SurveyCreateDto,
  'isActive' | 'surveyPreference' | 'feedbackModules'
>

type Step = {
  heading: string
  subheading: string
  title: string

  subSteps: Substep[]
  prev?: {
    label: string
    action: () => void
  }
  next: {
    label: string
    action: () => void
  }
}

type Substep = {
  stepName?: string
  description?: string
  fields: Field[]
}

type Field = {
  key: FormField
  required: boolean
  type: 'input' | 'select'
  inputType?: string
  readonly?: boolean
  selectConfig?: {
    items: readonly any[]
    itemTitle: string
    itemValue: string
  }
  label: string
  labelSuffix?: string
  description?: string
  placeHolder?: string
  information?: string
  quickAction?: {
    prepend?: {
      label: string
      action: (val: any) => void
    }
    append?: {
      label: string
      action: (val: any) => void
    }
  }
  rules: ((value: string) => true | string)[]
  handleUpdate: (val: string) => void
}
const copyToClipboard = (val: string) => {
  navigator.clipboard.writeText(val)
}
const props = defineProps<{
  defaultState: Omit<SurveyCreateDto, 'surveyPreference'>
  handleSubmit?: () => Promise<unknown>
}>()

const formValues = ref<Omit<SurveyCreateDto, 'surveyPreference'>>({
  ...props.defaultState,
})

const emit = defineEmits<{
  update: [value: Omit<SurveyCreateDto, 'surveyPreference'>]
}>()

const currentStep = ref(1)
const isDialogActive = ref(false)
const onDialogConfirm = ref<() => void>()
const dialogTitle = ref('')
const dialogDescription = ref('')

const handleBackConfirm = () => {
  if (window.history.length > 1) {
    window.history.back()
  }
}

const handleFormSubmitConfirm = () => {
  props.handleSubmit?.()
}

const onBackButtonClick = () => {
  isDialogActive.value = true
  dialogTitle.value = 'Changes in clinic setup'
  dialogDescription.value =
    'Are you sure you want to go back? Changes made to this clinic setup will not be updated.'
  onDialogConfirm.value = handleBackConfirm
}

const onDialogCancel = () => {
  isDialogActive.value = false
  dialogTitle.value = ''
  dialogDescription.value = ''
  onDialogConfirm.value = undefined
}

// TODO: Replace this when the i18n is setup
const steps: Step[] = [
  {
    heading: 'Create your new clinic',
    subheading:
      'Your practice, your space. Create and tailor the new clinic according to your work needs',
    title: 'Clinic name',

    subSteps: [
      {
        stepName: undefined,
        description: undefined,
        fields: [
          {
            key: 'surveyName',
            required: true,
            type: 'input',
            inputType: 'text',
            label: 'Clinic name',
            labelSuffix: '(required)',
            description:
              'This is the name of your new clinic where you can add new patients and manage their recalls.',
            placeHolder: 'Name your clinic',
            information: undefined,
            quickAction: undefined,
            rules: [
              (value: string) =>
                validateWithZod(SurveyCreateDtoSchema.shape.surveyName, value),
            ],
            handleUpdate: (val: string) => handleFieldUpdate('surveyName', val),
          },
        ],
      },
    ],
    next: {
      label: 'Continue with setup',
      action: () => {
        currentStep.value++
      },
    },
  },
  {
    heading: 'System setup',
    subheading:
      'To ensure the proper functioning of the dietitian tool, it must be linked to the Intake24 system. Follow the steps below to complete this setup process. If you  encounter any difficulties in completing the system setup, please reach out to our support team for assistance.',
    title: 'System setup',

    subSteps: [
      {
        stepName: 'Clinic integration code and clinic url',
        description:
          'Copy the integration code and clinic url provided below and paste them in their respective fields in the Intake24 system. For additional details click information icon.',
        fields: [
          {
            key: 'intake24Secret',
            required: true,
            type: 'input',
            inputType: 'text',
            readonly: true,
            label: 'Integration code',
            labelSuffix: '(required)',
            description: undefined,
            placeHolder: '123456',
            information: 'Integration code information.',
            quickAction: {
              prepend: undefined,
              append: {
                label: 'Copy',
                action: copyToClipboard,
              },
            },
            rules: [
              (value: string) =>
                validateWithZod(
                  SurveyCreateDtoSchema.shape.intake24Secret,
                  value,
                ),
            ],
            handleUpdate: (val: string) =>
              handleFieldUpdate('intake24Secret', val),
          },
          {
            key: 'intake24Host',
            required: true,
            type: 'input',
            inputType: 'text',
            readonly: true,
            label: 'Clinic url',
            labelSuffix: '(required)',
            description: undefined,
            placeHolder: 'https://myfoodswaps.com/api/recall/{alias}',
            information: 'Clinic url information.',
            quickAction: {
              prepend: undefined,
              append: {
                label: 'Copy',
                action: copyToClipboard,
              },
            },
            rules: [
              (value: string) =>
                validateWithZod(
                  SurveyCreateDtoSchema.shape.intake24Host,
                  value,
                ),
            ],
            handleUpdate: (val: string) =>
              handleFieldUpdate('intake24Host', val),
          },
        ],
      },
      {
        stepName: 'Intake24 system survey ID and country code',
        description:
          'First cop and paste survey ID name from Intake24 system in the field below. Then select the country code so that the system can complete the setup process. For additional details click information icon.',
        fields: [
          {
            key: 'intake24SurveyId',
            required: true,
            type: 'input',
            inputType: 'text',
            label: 'Survey ID',
            labelSuffix: '(required)',
            description:
              'Past the Intake24 survey ID name that you have used to create the survey in Intake24 system.',
            placeHolder: 'name',
            information: 'Survey ID information.',
            quickAction: undefined,
            rules: [
              (value: string) =>
                validateWithZod(
                  SurveyCreateDtoSchema.shape.intake24SurveyId,
                  value,
                ),
            ],
            handleUpdate: (val: string) =>
              handleFieldUpdate('intake24SurveyId', val),
          },
          {
            key: 'countryCode',
            required: true,
            type: 'input',
            inputType: 'select',
            selectConfig: {
              items: countryCodes,
              itemTitle: 'flag',
              itemValue: 'code',
            },
            label: 'Country code',
            labelSuffix: '(required)',
            description:
              'Select your workplace country code to link your clinic with Intake24 system.',
            placeHolder: 'https://admin.intake24.dev.',
            information: undefined,
            quickAction: {
              prepend: undefined,
              append: undefined,
            },
            rules: [
              (value: string) =>
                validateWithZod(SurveyCreateDtoSchema.shape.countryCode, value),
            ],
            handleUpdate: (val: string) =>
              handleFieldUpdate('countryCode', val),
          },
        ],
      },
    ],
    prev: {
      label: 'Go Back',
      action: () => {
        currentStep.value--
      },
    },
    next: {
      label: 'Continue with clinic setup',
      action: () => {
        currentStep.value++
      },
    },
  },
  {
    heading: 'Clinic Setup for <clinic name>', // TODO: Replace with clinic name
    subheading:
      'Personalise your patient experience by choosing a visual theme, select and tailor feedback templates to suit your preferences and set a default recall frequency to gather timely recall data from your patients.',
    title: 'Clinic setup',

    subSteps: [
      {
        stepName: 'Feedback template setup',
        description:
          'Choose a visual theme, select feedback templates, and compose default messages',
        fields: [
          {
            key: 'alias',
            required: true,
            type: 'input',
            inputType: 'text',
            label: 'Alias',
            labelSuffix: '(required)',
            description:
              'This is an alias that you can choose to identify this clinic in the Intake24 system.',
            placeHolder: 'Clinc alias',
            information: undefined,
            quickAction: undefined,
            rules: [
              (value: string) =>
                validateWithZod(SurveyCreateDtoSchema.shape.alias, value),
            ],
            handleUpdate: (val: string) => handleFieldUpdate('alias', val),
          },
        ],
      },
      {
        stepName: 'Recall reminder setup',
        description:
          'Set up how you want to send recall reminders to your patients through email',
        fields: [],
      },
    ],
    prev: {
      label: 'Go Back',
      action: () => {
        currentStep.value--
      },
    },
    next: {
      label: 'Save and continue',
      action: () => {
        isDialogActive.value = true
        onDialogConfirm.value = handleFormSubmitConfirm
        dialogTitle.value = 'New clinic creation'
        dialogDescription.value =
          'Are you sure you want to create a new clinic?'
      },
    },
  },
]

const handleFieldUpdate = (fieldName: FormField, newVal: string) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const isNextdisabled = computed(() => {
  const currentStepFields = steps[currentStep.value - 1]?.subSteps
    .map(subStep => subStep.fields)
    .flat()
  const isDisabled = currentStepFields?.some(field => {
    return field.rules.some(rule => {
      const validateResult = rule(formValues.value[field.key])
      return validateResult !== true
    })
  })
  // console.log(isDisabled)
  return isDisabled
})
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
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
}
</style>
