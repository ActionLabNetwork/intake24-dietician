<template>
  <div>
    <div class="mb-5">
      <BackButton class="mb-5" @click="onBackButtonClick" />
      <div class="text heading">Hi {{ authStore.profile?.firstName }},</div>
      <div class="w-50">
        <h1 class="text subheading">
          {{ steps[currentStep - 1]?.heading }}
        </h1>
        <h3 class="text description">
          {{ steps[currentStep - 1]?.subheading }}
        </h3>
      </div>
    </div>
    <v-stepper v-model="currentStep" elevation="0" class="my-5">
      <v-stepper-header
        style="background-color: rgb(252, 249, 244); box-shadow: none"
      >
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
            <v-row class="mt-10">
              <v-col :cols="currentStep < 3 ? 8 : 12">
                <div
                  v-for="(subStep, subStepIndex) in step.subSteps"
                  :key="subStepIndex + 'substep'"
                  class="mb-16"
                >
                  <template v-if="subStep.stepName">
                    <h1 class="text step-heading">
                      {{ subStep.stepName }}
                    </h1>
                    <h3 class="text description mb-10">
                      {{ subStep.description }}
                    </h3>
                  </template>
                  <!-- Input fields -->
                  <div v-for="field in subStep.fields" :key="field.key">
                    <template v-if="field.type === 'input'">
                      <VBaseInput
                        :name="field.key"
                        :type="field.inputType"
                        :readonly="field.readonly"
                        :placeholder="field.placeHolder"
                        :rules="field.rules"
                        :required="field.required"
                        :value="
                          field.render
                            ? field.render(formValues)
                            : formValues[field.key]
                        "
                        :select-config="field.selectConfig"
                        class="mt-3"
                        @update="field.handleUpdate"
                      >
                        <div>
                          <span class="input-label">
                            {{ field.label }}
                          </span>
                          <span
                            v-if="field.labelSuffix"
                            class="input-label suffix"
                          >
                            {{ ' ' }}{{ field.labelSuffix }}
                          </span>
                          <v-btn
                            v-if="field.information"
                            icon="mdi-information-outline"
                            variant="text"
                            size="small"
                            @click="
                              () => {
                                isDialogActive = true
                                dialogTitle = field.information?.title ?? ''
                                dialogDescription =
                                  field.information?.description ?? ''
                                dialogImgSrc = field.information?.imgSrc ?? ''
                                onDialogConfirm = undefined
                                dialogCancelText = 'Close'
                              }
                            "
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
                              class="text-none"
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
                <div v-if="currentStep === 3">
                  <FeedbackModules
                    :default-state="formValues"
                    @update="handleFeedbackModulesUpdate"
                  />
                  <RecallReminders
                    :default-state="formValues.surveyPreference"
                    @update="handleRecallRemindersUpdate"
                  />
                </div>
              </v-col>
              <!-- Contact / help with system setup -->
              <v-col v-if="currentStep === 2">
                <v-col>
                  <v-card
                    class="pa-5 bg-grey-lighten-4 mx-auto"
                    flat
                    style="width: fit-content"
                  >
                    Not able to complete system setup?
                    <br />
                    Contact -
                    <em>
                      <a
                        href="mailto:support@intake24.com"
                        class="text-body-1 text-primary"
                      >
                        support@intake24.com
                      </a>
                    </em>
                  </v-card>
                </v-col>
              </v-col>
            </v-row>
          </v-stepper-window-item>
        </v-form>
        <v-row>
          <v-col> </v-col>
        </v-row>
      </v-stepper-window>

      <v-stepper-actions style="justify-content: flex-start" disabled="false">
        <!-- Back button -->
        <template #prev>
          <v-btn
            v-if="steps[currentStep - 1]?.prev"
            class="text-capitalize mr-4"
            variant="outlined"
            color="black"
            @click="steps[currentStep - 1]?.prev?.action"
          >
            {{ steps[currentStep - 1]?.prev?.label }}
          </v-btn>
        </template>

        <!-- Next button -->
        <template #next>
          <v-btn
            class="text-none"
            :disabled="isNextdisabled"
            variant="flat"
            color="primary"
            @click="steps[currentStep - 1]?.next.action"
          >
            {{ steps[currentStep - 1]?.next.label }}
          </v-btn>
        </template>
      </v-stepper-actions>
    </v-stepper>
    <BaseDialog
      v-model="isDialogActive"
      :on-confirm="onDialogConfirm"
      :on-cancel="onDialogCancel"
      :on-cancel-text="dialogCancelText"
    >
      <template #title>{{ dialogTitle }}</template>
      {{ dialogDescription }}
      <v-img v-if="dialogImgSrc" :src="dialogImgSrc" />
    </BaseDialog>
  </div>
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
import { useAuthStore } from '@intake24-dietician/portal/stores/auth'
import FeedbackModules from '../master-settings/FeedbackModules.vue'
import RecallReminders from '../master-settings/RecallReminders.vue'
import { useToast } from 'vue-toast-notification'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
import { allowedIntake24Hosts } from '@intake24-dietician/portal/constants/integration'
import { env } from '../../config/env'

type FormField = keyof Omit<
  SurveyCreateDto,
  'isActive' | 'surveyPreference' | 'feedbackModules'
>

type Step = {
  heading: string
  subheading: string
  title: string
  subSteps?: Substep[]
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
  /** renders the field specified by the key if not specified. */
  render?: (value: SurveyCreateDto) => number | string
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
  information?: {
    title: string
    description: string
    imgSrc?: string
  }
  quickAction?: {
    prepend?: {
      label: string
      action: (val: string) => void
    }
    append?: {
      label: string
      action: (val: string) => void
    }
  }
  rules: ((value: string) => true | string)[]
  handleUpdate: (val: string) => void
}

const authStore = useAuthStore()
const $toast = useToast()

const copyToClipboard = (val: string) => {
  navigator.clipboard.writeText(val)
}
const props = defineProps<{
  defaultState: SurveyCreateDto
  handleSubmit: () => Promise<void>
}>()

const formValues = ref<SurveyCreateDto>({
  ...props.defaultState,
})

const emit = defineEmits<{
  update: [value: SurveyCreateDto]
}>()

const currentStep = ref(1)
const isDialogActive = ref(false)
const onDialogConfirm = ref<() => Promise<void>>()
const dialogTitle = ref('')
const dialogDescription = ref('')
const dialogImgSrc = ref('')
const dialogCancelText = ref('Cancel')

const handleFeedbackModulesUpdate = (value: SurveyCreateDto | undefined) => {
  if (!formValues.value || !value) {
    return
  }
  formValues.value = { ...formValues.value, ...value }
  emit('update', { ...formValues.value })
}

const handleRecallRemindersUpdate = (value: {
  reminderCondition: ReminderCondition
  reminderMessage: string
}) => {
  if (!formValues.value) {
    return
  }

  formValues.value = {
    ...formValues.value,
    surveyPreference: {
      ...formValues.value.surveyPreference,
      reminderCondition: value.reminderCondition,
      reminderMessage: value.reminderMessage,
    },
  }
  emit('update', { ...formValues.value })
}

const handleBackConfirm = (): Promise<void> => {
  return new Promise(resolve => {
    if (window.history.length > 1) {
      window.history.back()
    }
    resolve()
  })
}

const handleFormSubmitConfirm = async () => {
  await props.handleSubmit()
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

const clinicUrl = ref('')
// TODO: Replace this when the i18n is setup
const steps = ref<Step[]>([
  {
    heading: 'Welcome to Intake24 clinical tool',
    subheading:
      'This is  your dedicated space for receiving recall data and providing tailored dietary feedback to your patients. Let’s create and customise your first clinic where you can start adding  your patients.',
    title: 'Clinic name',
    subSteps: [
      {
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
            labelSuffix: '',
            description: undefined,
            placeHolder: '123456',
            information: {
              title: 'Integration code',
              description:
                'Please find the following field on the Intake24 admin page (Surveys tab) and paste the code.',
              imgSrc: '/clinic-setup/help-integration-code.png',
            },
            quickAction: {
              prepend: undefined,
              append: {
                label: 'Copy',
                action: str => {
                  copyToClipboard(str)
                  $toast.info('Copied to clipboard')
                },
              },
            },
            rules: [
              (value: string) =>
                validateWithZod(
                  SurveyCreateDtoSchema.shape.intake24Secret,
                  value,
                ),
            ],
            handleUpdate: () => {},
          },
          {
            key: 'intake24Host',
            render: values => {
              const _clinicUrl =
                env.VITE_AUTH_API_HOST + '/recall/' + values['alias']
              clinicUrl.value = _clinicUrl
              return _clinicUrl
            },
            required: true,
            type: 'input',
            inputType: 'text',
            readonly: true,
            label: 'Clinic url',
            labelSuffix: '',
            description: undefined,
            information: {
              title: 'Clinic url',
              description:
                'Please find the following field on the Intake24 admin page (Surveys tab) and paste the code.',
              imgSrc: '/clinic-setup/help-clinic-url.png',
            },
            quickAction: {
              prepend: undefined,
              append: {
                label: 'Copy',
                action: () => {
                  copyToClipboard(clinicUrl.value)
                  $toast.info('Copied to clipboard')
                },
              },
            },
            rules: [
              (value: string) =>
                validateWithZod(
                  SurveyCreateDtoSchema.shape.intake24Host,
                  value,
                ),
            ],
            handleUpdate: () => {},
          },
        ],
      },
      {
        stepName: 'Intake24 system survey ID and country code',
        description:
          'First copy and paste survey ID name from Intake24 system in the field provided below. Then select the country code so that the system can complete the setup process. For additional details click information icon.',
        fields: [
          {
            key: 'intake24SurveyId',
            required: true,
            type: 'input',
            inputType: 'text',
            label: 'Intake24 Survey ID',
            labelSuffix: '(required)',
            description:
              'Pass the Intake24 survey ID name that you have used to create the survey in Intake24 system.',
            placeHolder: 'name',
            information: {
              title: 'Survey ID',
              description: 'Survey ID information.',
            },
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
            key: 'intake24Host',
            required: true,
            type: 'input',
            inputType: 'select',
            selectConfig: {
              items: allowedIntake24Hosts,
              itemTitle: 'title',
              itemValue: 'value',
            },
            label: 'Intake24 admin base url',
            labelSuffix: '(required)',
            description:
              'Select your workplace base url to link your clinic with Intake24 system.',
            placeHolder: undefined,
            information: undefined,
            quickAction: {
              prepend: undefined,
              append: undefined,
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
            placeHolder: undefined,
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
    heading: `Clinic Setup for ${formValues.value.surveyName}`,
    subheading:
      'Personalise your patient experience by choosing a visual theme, select and tailor feedback templates to suit your preferences and set a default recall frequency to gather timely recall data from your patients.',
    title: 'Clinic setup',
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
])

const handleFieldUpdate = (fieldName: FormField, newVal: string) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const isNextdisabled = computed(() => {
  const _currentStep = steps.value[currentStep.value - 1]
  if (!_currentStep?.subSteps) return false

  const currentStepFields = _currentStep?.subSteps
    .map(subStep => subStep.fields)
    .flat()
  const isDisabled = currentStepFields?.some(field => {
    return field.rules.some(rule => {
      const validateResult = rule(formValues.value[field.key])
      return validateResult !== true
    })
  })
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

  &.step-heading {
    color: #000;
    font-family: Roboto;
    font-size: 20px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
  }

  &.subheading {
    color: #1e1e1e;
    font-family: Roboto;
    font-size: 16px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  &.description {
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
