<template>
  <div class="wrapper">
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center mt-12"
      >
        <div>
          <h1 class="text heading">Recall reminder setup</h1>
          <h3 class="text subheading">
            Select a default recall frequency when you want your patients to
            complete and share recall data with you. The frequency can be
            personalised within patient information page.
          </h3>
        </div>
        <div class="alert-text">
          <div>
            <div class="d-flex align-center">
              <div>
                <v-icon icon="mdi-alert-outline" size="large" start />
              </div>
              <div class="font-weight-medium">
                There are changes made in master module setup, review and
                confirm changes before proceeding!
              </div>
            </div>
          </div>
          <div class="align-self-center">
            <v-btn
              color="primary text-none"
              class="mt-3 mt-sm-0"
              :disabled="!isFormValid"
              type="submit"
              @click.prevent="handleSubmit"
            >
              Review and confirm changes
            </v-btn>
          </div>
        </div>
      </div>

      <v-divider class="my-10" />
      <div>
        <v-form ref="form">
          <v-row
            v-for="(fieldConfig, fieldName) in formConfig"
            :key="fieldName"
            class="mt-5"
          >
            <v-col cols="12" :sm="smColOptions(fieldConfig.column)">
              <div :class="fieldConfig.class">
                <div class="d-flex justify-start align-start">
                  <div>
                    <div>
                      <div
                        :class="
                          fieldConfig.heading.class ||
                          'text section-heading-2 pl-0 pl-sm-5'
                        "
                      >
                        {{ fieldConfig.heading.label }}
                      </div>
                      <div
                        v-if="fieldConfig.subheading"
                        :class="
                          fieldConfig.subheading.class ||
                          'text section-subheading pl-0 pl-sm-5'
                        "
                      >
                        {{ fieldConfig.subheading.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
            <v-spacer />
            <v-col
              cols="12"
              :sm="smColOptions(fieldConfig.column)"
              class="self-end"
            >
              <div
                v-if="fieldConfig.element === 'textarea'"
                class="survey-id-input"
              >
                <v-textarea
                  variant="solo-filled"
                  label="Write something here..."
                ></v-textarea>
              </div>
              <div v-else>
                <component
                  :is="fieldConfig.component"
                  v-bind="fieldConfig.props"
                  :value="fieldConfig.value"
                  @update="fieldConfig.onUpdate && fieldConfig.onUpdate($event)"
                />
              </div>
            </v-col>
          </v-row>
          <div class="mt-10">
            <p class="font-weight-medium">Review and save changes</p>
            <div class="text subheading">
              You have made changes to the master module setup. Review and
              confirm the changes before you proceed with adding patients or
              reviewing recall feedback
            </div>
            <v-btn
              color="primary"
              class="text-none mt-4"
              type="submit"
              :disabled="!isFormValid"
              @click.prevent="handleSubmit"
            >
              Review and confirm changes
            </v-btn>
          </div>
        </v-form>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineComponent, onMounted, ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { Theme } from '@intake24-dietician/common/types/theme'
import { PatientSchema } from '@/schema/patient'
import { useToast } from 'vue-toast-notification'
import { DEFAULT_ERROR_MESSAGE } from '@/constants/index'
import UpdateRecallFrequency from '../patients/patient-details/UpdateRecallFrequency.vue'
// const { t } = useI18n<i18nOptions>()

type CSSClass = string | string[] | object

interface FormFieldConfig<TVal, TProps = Record<string, unknown>> {
  heading: {
    label: string
    class?: CSSClass
  }
  subheading?: {
    label: string
    class?: CSSClass
  }
  component?: ReturnType<typeof defineComponent>
  element?: string
  props?: TProps
  value?: TVal
  class?: CSSClass
  column: 1 | 2
  onUpdate?: (newValue: TVal) => void
}

interface FormConfig {
  [key: string]: FormFieldConfig<any, any>
}

const $toast = useToast()

const form = ref()

const theme = ref<Theme>('Classic')
const sendAutomatedFeedback = ref<boolean>(false)

const smColOptions = (column: 1 | 2) => (column === 1 ? 12 : 5)

const aggregatedData = computed(() => ({
  theme: theme.value,
  sendAutomatedFeedback: sendAutomatedFeedback.value,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

const isFormValid = computed(() => {
  return PatientSchema.safeParse(aggregatedData.value).success
})

const handleSubmit = async (): Promise<void> => {
  await form.value.validate()

  return new Promise((resolve, reject) => {
    // Validate with zod
    const result = PatientSchema.safeParse(aggregatedData.value)

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

    resolve()
  })
}

let formConfig: FormConfig
onMounted(() => {
  formConfig = {
    recallReminder: {
      heading: {
        label: 'Default recall reminder setting',
      },
      subheading: {
        label:
          'Select a default recall frequency period, when you want your patients to complete and submit their recall data',
      },
      component: UpdateRecallFrequency,
      props: {
        hideLabel: true,
      },
      value: '',
      column: 2,
      onUpdate: (value: string) => {
        console.log({ value })
      },
    },
    reminderMessage: {
      heading: { label: 'Default frequency reminder message' },
      subheading: {
        label:
          'Set up a default reminder message to be shared with your patient to complete and submit their recall data',
      },
      element: 'textarea',
      column: 2,
      onUpdate: (newReminderMessage: string) => {
        formConfig['reminderMessage']!.value = newReminderMessage
      },
    },
  }
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

.survey-id-input {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>
