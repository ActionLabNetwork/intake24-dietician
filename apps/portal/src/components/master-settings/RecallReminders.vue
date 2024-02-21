<template>
  <v-container fluid>
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div>
        <h1 class="text section-heading">Recall reminder setup</h1>
        <h3 class="text subheading">
          Select a default recall frequency when you want your patients to
          complete and share recall data with you. The frequency can be
          personalised within patient information page.
        </h3>
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
              style="background: inherit"
              class="survey-id-input"
            >
              <v-textarea
                v-model="debouncedFrequencyReminderMessage"
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
      </v-form>
    </div>
  </v-container>
</template>

<script lang="ts" setup>
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { INPUT_DEBOUNCE_TIME } from '@/constants/index'
import { useDebounceFn } from '@vueuse/core'
import UpdateRecallFrequency from '../patients/patient-details/UpdateRecallFrequency.vue'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
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

const props = defineProps<{
  defaultState?: {
    reminderCondition: ReminderCondition
    reminderMessage: string
  }
}>()

const emit = defineEmits<{
  update: [
    value: { reminderCondition: ReminderCondition; reminderMessage: string },
  ]
}>()

const form = ref()
const frequencyReminderMessage = ref(
  toRefs(props).defaultState.value?.reminderMessage,
)
// eslint-disable-next-line vue/no-setup-props-destructure
const recallReminder = ref<ReminderCondition>(
  props.defaultState?.reminderCondition ?? {
    reminderEvery: { every: 5, unit: 'days' },
    reminderEnds: { type: 'never' },
  },
)

const debouncedFrequencyReminderMessage = computed({
  get: () => frequencyReminderMessage.value ?? '',
  set: useDebounceFn((newReminderMessage: string) => {
    frequencyReminderMessage.value = newReminderMessage
  }, INPUT_DEBOUNCE_TIME),
})

const smColOptions = (column: 1 | 2) => (column === 1 ? 12 : 5)

let formConfig: FormConfig = reactive({})
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
        defaultState: recallReminder.value,
        hideLabel: true,
      },
      value: undefined,
      column: 2,
      onUpdate: (newRecallReminder: ReminderCondition) => {
        recallReminder.value = newRecallReminder
        emit('update', {
          reminderCondition: recallReminder.value,
          reminderMessage: frequencyReminderMessage.value ?? '',
        })
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
      value: undefined,
    },
  }
})

const aggregatedData = computed(() => ({
  recallReminder: recallReminder.value,
  frequencyReminderMessage: frequencyReminderMessage.value,
}))

watch(
  aggregatedData,
  newAggregatedData => {
    const { recallReminder, frequencyReminderMessage } = newAggregatedData
    const formData: {
      reminderCondition: ReminderCondition
      reminderMessage: string
    } = {
      reminderCondition: recallReminder,
      reminderMessage: frequencyReminderMessage ?? '',
    }

    emit('update', formData)
  },
  { immediate: true, deep: true },
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

.survey-id-input {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
}
</style>
