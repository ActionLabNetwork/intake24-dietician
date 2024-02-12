<template>
  <v-container>
    <div v-if="mode === 'Add'">
      <BackButton class="mb-5" />
      <div>
        <h1 class="text heading">{{ t('surveys.addNewSurvey.title') }}</h1>
        <h3 class="text subheading">
          {{ t('surveys.addNewSurvey.subtitle') }}
        </h3>
      </div>
      <v-divider class="my-10"></v-divider>
    </div>

    <v-form>
      <div
        :width="mdAndUp ? '100%' : '100%'"
        class="mt-5"
        style="background: inherit; border: 0"
      >
        <div v-for="(config, fieldName) in formSurveyConfig" :key="fieldName">
          <div v-if="config.type === 'input'" class="mb-5">
            <BaseInput
              :type="config.inputType"
              :name="config.key"
              :rules="config.rules"
              :autocomplete="config.autocomplete"
              :value="formValues[fieldName]"
              bordered
              :suffix-icon="config.suffixIcon"
              :handle-icon-click="config.handleSuffixIconClick"
              :class="config.class"
              :required="config.required"
              @update="config.handleUpdate"
            >
              <div>
                <span class="input-label">
                  {{ config.label }}
                </span>
                <span v-if="config.labelSuffix" class="input-label suffix">
                  {{ config.labelSuffix }}
                </span>
              </div>
              <div class="input-label description">
                {{ config.description }}
              </div>
            </BaseInput>
          </div>
        </div>
      </div>
      <div v-if="mode === 'Add'" class="mt-5">
        <v-btn
          class="text-none"
          variant="outlined"
          @click="submitDialog = true"
        >
          Cancel and go back
        </v-btn>
        <BaseButton
          class="mt-3 mt-sm-0 ml-5"
          :disabled="false"
          type="submit"
          @click.prevent="handleSubmit"
        >
          Continue with setup
        </BaseButton>
      </div>
      <div>
        <BaseDialog v-model="submitDialog" :on-confirm="handleDialogConfirm">
          <template #title> Attention! </template>
          Are you sure you want to cancel and go back? Any changes made to the
          new clinic will get deleted.
        </BaseDialog>
      </div>
    </v-form>
  </v-container>
</template>

<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'
import BackButton from '../common/BackButton.vue'
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
import BaseButton from '../common/BaseButton.vue'
import BaseDialog from '../common/BaseDialog.vue'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'
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

const clinicStore = useClinicStore()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<Omit<SurveyCreateDto, 'surveyPreference'>>({
  ...props.defaultState,
})

const submitDialog = ref(false)

const handleFieldUpdate = (fieldName: FormField, newVal: string) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const handleDialogConfirm = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    clinicStore.navigateToSurveyPatientList()
  }
}

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
    handleUpdate: val => handleFieldUpdate('surveyName', val),
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
  intake24AdminBaseUrl: {
    key: 'intake24AdminBaseUrl',
    label: '',
    description: '',
    required: true,
    labelSuffix: ' (required)',
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(
          SurveyCreateDtoSchema.shape.intake24AdminBaseUrl,
          value,
        ),
    ],
    handleUpdate: val => handleFieldUpdate('intake24AdminBaseUrl', val),
  },
  //TODO: Add missing i18n keys for this field
  countryCode: {
    key: 'countryCode',
    label: '',
    description: '',
    required: true,
    labelSuffix: ' (required)',
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(SurveyCreateDtoSchema.shape.countryCode, value),
    ],
    handleUpdate: val => handleFieldUpdate('countryCode', val),
  },
}
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
