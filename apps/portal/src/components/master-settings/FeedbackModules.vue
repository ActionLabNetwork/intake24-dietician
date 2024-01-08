<template>
  <div>
    <v-container>
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
              <div>
                <component
                  :is="fieldConfig.component"
                  v-bind="fieldConfig.props"
                  :value="fieldConfig.value"
                  :class="fieldConfig.componentClass"
                  @update="fieldConfig.onUpdate && fieldConfig.onUpdate($event)"
                />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, onMounted, ref, toRefs, watch } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import { Theme } from '@intake24-dietician/common/types/theme'
import { useToast } from 'vue-toast-notification'
import ModuleSelectionAndFeedbackPersonalisation, {
  FeedbackMapping,
} from './ModuleSelectionAndFeedbackPersonalisation.vue'
import { SurveyPreferencesDTO } from '@intake24-dietician/common/entities-new/preferences.dto'
import type { FeedbackModuleDto } from '@intake24-dietician/common/entities-new/feedback.dto'
import { SurveyDto } from '@intake24-dietician/common/entities-new/survey.dto'
// const { t } = useI18n<i18nOptions>()

export type SurveyPreferenceFeedbackModules = SurveyPreferencesDTO & {
  feedbackModules: (FeedbackModuleDto & {
    name: string
    isActive: boolean
    feedbackAboveRecommendedLevel: string
    feedbackBelowRecommendedLevel: string
  })[]
}

const props = defineProps<{
  defaultState: SurveyDto
  submit: () => Promise<void>
}>()

const emit = defineEmits<{
  update: [value: SurveyDto]
}>()

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
  componentClass?: CSSClass
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

type ModuleName =
  | 'Meal diary'
  | 'Carbs exchange'
  | 'Energy intake'
  | 'Fibre intake'
  | 'Water intake'

const findFeedbackModel = (name: ModuleName) => {
  return props.defaultState.feedbackModules.find(module => module.name === name)
}

const createFeedbackEntry = (key: ModuleName) => {
  const feedbackModel = findFeedbackModel(key)

  if (!feedbackModel) {
    $toast.error('Failed to load feedback modules')
    return {
      name: 'N/A',
      feedbackBelow: '',
      feedbackAbove: '',
      isActive: false,
    }
  }

  return {
    name: feedbackModel.name,
    feedbackBelow: feedbackModel.feedbackBelowRecommendedLevel,
    feedbackAbove: feedbackModel.feedbackAboveRecommendedLevel,
    isActive: feedbackModel.isActive,
  }
}

const $toast = useToast()

const feedbackModuleSetup = ref(toRefs(props).defaultState.value)

const theme = ref<Theme>(
  toRefs(props).defaultState.value.surveyPreference.theme as Theme,
)
const sendAutomatedFeedback = ref<boolean>(
  toRefs(props).defaultState.value.surveyPreference.sendAutomatedFeedback,
)
const feedbackMapping = ref<FeedbackMapping>({
  '/meal-diary': createFeedbackEntry('Meal diary'),
  '/carbs-exchange': createFeedbackEntry('Carbs exchange'),
  '/energy-intake': createFeedbackEntry('Energy intake'),
  '/fibre-intake': createFeedbackEntry('Fibre intake'),
  '/water-intake': createFeedbackEntry('Water intake'),
})

const handleVisualThemeUpdate = (_theme: Theme) => {
  feedbackModuleSetup.value = {
    ...feedbackModuleSetup.value,
    surveyPreference: {
      ...feedbackModuleSetup.value.surveyPreference,
      theme: _theme,
    },
  }
  theme.value = _theme
}

const handleSendAutomatedFeedback = (automatedFeedback: boolean) => {
  feedbackModuleSetup.value = {
    ...feedbackModuleSetup.value,
    surveyPreference: {
      ...feedbackModuleSetup.value.surveyPreference,
      sendAutomatedFeedback: automatedFeedback,
    },
  }
  sendAutomatedFeedback.value = automatedFeedback
}

const handleFeedbackModulesUpdate = (feedbackMapping: FeedbackMapping) => {
  const updatedFeedbackModules = Object.values(feedbackMapping).reduce(
    (acc, updatedModule) => {
      const feedbackModule = feedbackModuleSetup.value.feedbackModules.find(
        module => module.name === updatedModule.name,
      )

      if (feedbackModule) {
        acc.push({
          ...feedbackModule,
          isActive: updatedModule.isActive,
          feedbackAboveRecommendedLevel: updatedModule.feedbackAbove,
          feedbackBelowRecommendedLevel: updatedModule.feedbackBelow,
        })
      }

      return acc
    },
    [] as typeof feedbackModuleSetup.value.feedbackModules,
  )

  feedbackModuleSetup.value = {
    ...feedbackModuleSetup.value,
    feedbackModules: updatedFeedbackModules,
  }
}

let formConfig: FormConfig
onMounted(() => {
  formConfig = {
    visualThemeSelection: {
      heading: {
        label: 'Visual theme selection',
        class: 'text section-heading',
      },
      class: 'text section-heading',
      column: 2,
    },
    themeSelector: {
      heading: { label: 'Select a theme relevant for your patients' },
      subheading: {
        label:
          'Select a theme that is relevant for your patients in general. You can change the theme specific to a patient from patient information page.',
      },
      component: VisualThemeSelector,
      componentClass: 'ml-5',
      props: {
        defaultState: theme.value,
        hideLabel: true,
      },
      value: theme,
      column: 1,
      onUpdate: (newTheme: Theme) => {
        handleVisualThemeUpdate(newTheme)
      },
    },
    sendAutomatedFeedback: {
      heading: {
        label: 'Send patient automated feedback after every recall',
        class: 'text section-heading',
      },
      subheading: {
        label:
          'Every time a patient completes their recall, an automated feedback based on their recall data and pre-defined feedbacks will be shared with them on their email address',
      },
      component: SendAutomatedFeedbackToggle,
      props: {
        defaultState: sendAutomatedFeedback.value,
        hideLabel: true,
      },
      value: sendAutomatedFeedback,
      column: 2,
      onUpdate: (isEnabled: boolean) => {
        handleSendAutomatedFeedback(isEnabled)
      },
    },
    // TODO: Add modules component
    moduleSelectionAndFeedbackPersonalisation: {
      heading: {
        label: 'Module selection and feedback personalisation',
        class: 'text section-heading',
      },
      component: ModuleSelectionAndFeedbackPersonalisation,
      column: 1,
      props: {
        defaultState: feedbackMapping.value,
      },
      onUpdate: handleFeedbackModulesUpdate,
    },
  }
})

watch(feedbackModuleSetup, formData => {
  emit('update', formData)
})

// Helpers
const smColOptions = (column: 1 | 2) => (column === 1 ? 12 : 5)
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
</style>
