<template>
  <div v-if="surveyQuery.isPending.value">
    <BaseProgressCircular />
  </div>
  <div v-else-if="surveyQuery.isError.value">
    <!-- TODO: Create an error page  -->
    Error page
  </div>
  <div v-else class="wrapper">
    <v-container>
      <BackButton class="mb-5" />
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center mt-12"
      >
        <div>
          <h1 class="text heading">New patient information</h1>
        </div>
        <div>
          <BaseButton
            class="mt-3 mt-sm-0"
            :disabled="disableSubmit"
            type="submit"
            @click.prevent="handleSubmit().showConfirmDialog"
          >
            Add patient to the clinic
          </BaseButton>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form ref="form">
        <div>
          <ContactDetails
            :default-state="
              patientForm.formValues.value.contactDetailsFormValues
            "
            mode="Add"
            @update="
              patientForm.handleFormUpdate('contactDetailsFormValues', $event)
            "
          />
          <PersonalDetails
            :default-state="
              patientForm.formValues.value.personalDetailsFormValues
            "
            class="mt-16"
            @update="
              patientForm.handleFormUpdate('personalDetailsFormValues', $event)
            "
          />
          <VisualThemeSelector
            v-model="patientForm.formValues.value.theme"
            class="mt-10"
            @update="patientForm.handleFormUpdate('theme', $event)"
          />
          <SendAutomatedFeedbackToggle
            :default-state="patientForm.formValues.value.sendAutomatedFeedback"
            class="mt-10"
            @update="
              patientForm.handleFormUpdate('sendAutomatedFeedback', $event)
            "
          />
          <UpdateRecallFrequency
            :default-state="patientForm.formValues.value.recallFrequency"
            class="mt-10"
            @update="patientForm.handleFormUpdate('recallFrequency', $event)"
          />
        </div>
        <div>
          <p class="font-weight-medium">
            Review and add new patient to the records
          </p>
          <v-btn
            color="primary"
            class="text-none mt-4"
            type="submit"
            :disabled="disableSubmit"
            @click.prevent="handleSubmit().showConfirmDialog"
          >
            Add patient to the clinic
          </v-btn>
        </div>
      </v-form>
      <DialogConfirmAdd
        v-model="confirmDialog"
        :clinic-name="clinicName"
        :full-name="fullName"
        :on-confirm="handleSubmit().submit"
      />
      <DialogRouteLeave
        :unsaved-changes="patientForm.isDirty.value && !isSubmitting"
      />
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import DialogConfirmAdd from './DialogConfirmAdd.vue'
import DialogRouteLeave from '@intake24-dietician/portal/components/common/DialogRouteLeave.vue'
import { computed, onMounted, ref, watch } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
import {
  PatientUpdateDto,
  PatientUpdateDtoSchema,
} from '@intake24-dietician/common/entities-new/user.dto'
import { Theme } from '@intake24-dietician/common/types/theme'
import BaseButton from '@intake24-dietician/portal/components/common/BaseButton.vue'
import BaseProgressCircular from '@intake24-dietician/portal/components/common/BaseProgressCircular.vue'
import ContactDetails, {
  ContactDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import PersonalDetails, {
  PersonalDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import UpdateRecallFrequency from '@intake24-dietician/portal/components/patients/patient-details/UpdateRecallFrequency.vue'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import { useForm } from '@intake24-dietician/portal/composables/useForm'
import { useAddPatient } from '@intake24-dietician/portal/mutations/usePatients'
import { useSurveyById } from '@intake24-dietician/portal/queries/useSurveys'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { z } from 'zod'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'
// const { t } = useI18n<i18nOptions>()

// Default values
const defaultTheme: Theme = 'Classic'
const defaultSendAutomatedFeedback = false
const defaultRecallFrequency: ReminderCondition = {
  reminderEvery: {
    every: 5,
    unit: 'days',
  },
  reminderEnds: {
    type: 'never',
  },
}

const router = useRouter()
const route = useRoute()

const $toast = useToast()

const clinicStore = useClinicStore()

const surveyQuery = useSurveyById(route.params['surveyId'] as string)
const addPatientMutation = useAddPatient()

const isSubmitting = ref(false)
const confirmDialog = ref(false)
const form = ref()
const formValues = ref({
  contactDetailsFormValues: ref<ContactDetailsFormValues>({
    firstName: '',
    middleName: '',
    lastName: '',
    avatar: '',
    mobileNumber: '',
    email: '',
    address: '',
  }),
  personalDetailsFormValues: ref<PersonalDetailsFormValues>({
    dateOfBirth: '01/01/1980',
    gender: 'Male',
    weightHistory: [{ weight: 80, timestamp: new Date() }],
    height: 180,
    additionalNotes: '',
    patientGoal: '',
  }),
  theme: ref<Theme>('Classic'),
  sendAutomatedFeedback: ref<boolean>(false),
  recallFrequency: ref<ReminderCondition>({
    reminderEvery: {
      every: 5,
      unit: 'days',
    },
    reminderEnds: {
      type: 'never',
    },
  }),
})

const patientForm = useForm<
  typeof formValues,
  {
    surveyId: string
    email: string
    patient: PatientUpdateDto
  }
>({
  initialValues: formValues,
  schema: z.object({
    surveyId: z.string(),
    email: z.string().email(),
    patient: PatientUpdateDtoSchema,
  }),
  $toast: $toast,
  mutationFn: addPatientMutation.mutateAsync,
  onSuccess: () => {
    $toast.success('Patient details added successfully')
    router.push({
      name: 'Survey Patient List',
      params: { surveyId: route.params['surveyId'] as string },
    })
  },
})

const clinicName = computed(() => {
  return clinicStore.currentClinic?.surveyName ?? ''
})

const fullName = computed(() => {
  const contactDetails = patientForm.formValues.value.contactDetailsFormValues
  return `${contactDetails.firstName} ${contactDetails.lastName}`
})

const disableSubmit = computed(() => {
  return !patientForm.isDirty.value
})

const aggregatedData = computed(() => ({
  ...patientForm.formValues.value.contactDetailsFormValues,
  ...patientForm.formValues.value.personalDetailsFormValues,
  additionalDetails: null,
  theme: patientForm.formValues.value.theme,
  sendAutomatedFeedback: patientForm.formValues.value.sendAutomatedFeedback,
  recallFrequency: patientForm.formValues.value.recallFrequency,
  isArchived: false,
}))

const handleSubmit = () => {
  const submitValue = {
    surveyId: route.params['surveyId'] as string,
    email: aggregatedData.value.email ?? '',
    patient: aggregatedData.value,
  }

  const showConfirmDialog = () => {
    const isValid = patientForm.isFormValid(submitValue)

    if (!isValid) return
    confirmDialog.value = true
  }
  const submit = async () => {
    isSubmitting.value = true
    await patientForm.handleSubmit(submitValue)
  }

  return { showConfirmDialog, submit }
}

const initWithSurveyPreferences = () => {
  const survey = surveyQuery.data.value
  patientForm.formValues.value = {
    ...patientForm.formValues.value,
    theme: survey?.surveyPreference.theme ?? defaultTheme,
    sendAutomatedFeedback:
      survey?.surveyPreference.sendAutomatedFeedback ??
      defaultSendAutomatedFeedback,
    recallFrequency:
      survey?.surveyPreference.reminderCondition ?? defaultRecallFrequency,
  }

  patientForm.serverDataSnapshot.value = {
    ...patientForm.serverDataSnapshot.value,
    theme: survey?.surveyPreference.theme ?? defaultTheme,
    sendAutomatedFeedback:
      survey?.surveyPreference.sendAutomatedFeedback ??
      defaultSendAutomatedFeedback,
    recallFrequency:
      survey?.surveyPreference.reminderCondition ?? defaultRecallFrequency,
  }
}

onMounted(() => {
  initWithSurveyPreferences()
  isSubmitting.value = false
})

watch(
  () => surveyQuery.data.value,
  () => {
    initWithSurveyPreferences()
  },
)
</script>

<style scoped lang="scss">
.wrapper {
  background: rgb(252, 249, 244);
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
