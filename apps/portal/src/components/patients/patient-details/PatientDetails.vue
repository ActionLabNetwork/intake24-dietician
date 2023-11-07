<template>
  <div class="wrapper">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div>
        <h1 class="text heading">Patient details</h1>
      </div>
      <div class="d-flex align-center justify-center">
        <div class="mr-6">
          <!-- Patient Status -->
          <span class="text patient-status">Patient status: </span>
          <v-chip
            variant="flat"
            :color="!!patient?.deletionDate ? 'neutral' : 'success'"
            :text="!!patient?.deletionDate ? 'Archived' : 'Active'"
          >
          </v-chip>
        </div>
        <div>
          <!-- Account action -->
          <AccountActionMenu
            v-if="patient"
            :patient="patient"
            @update="patientQuery.invalidatePatientByIdQuery()"
          />
        </div>
      </div>
    </div>
    <v-form v-if="patientQuery.isSuccess.value" ref="form" class="mt-8">
      <div>
        <ContactDetails
          :default-state="contactDetailsFormValues"
          mode="Edit"
          :handle-submit="handleSubmit"
          @update="handleContactDetailsUpdate"
        />
        <PersonalDetails
          :default-state="personalDetailsFormValues"
          class="mt-16"
          @update="handlePersonalDetailsUpdate"
        />
        <VisualThemeSelector
          class="mt-10"
          :default-state="theme"
          @update="handleVisualThemeUpdate"
        />
        <SendAutomatedFeedbackToggle
          class="mt-10"
          :default-state="sendAutomatedFeedback"
          @update="handleSendAutomatedFeedback"
        />
        <UpdateRecallFrequency
          class="mt-10"
          :default-state="recallFrequency"
          @update="handleRecallFrequencyUpdate"
        />
      </div>
      <div>
        <v-btn
          color="primary"
          class="text-none mt-4"
          type="submit"
          :disabled="!isFormValid"
          @click.prevent="handleSubmit"
        >
          Update patient details
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { DEFAULT_ERROR_MESSAGE } from '@intake24-dietician/portal/constants'
import ContactDetails, {
  ContactDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import PersonalDetails from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import { PersonalDetailsFormValues } from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import UpdateRecallFrequency from '@intake24-dietician/portal/components/patients/patient-details/UpdateRecallFrequency.vue'
import { ReminderConditions } from '@intake24-dietician/common/types/reminder'
import { Theme } from '@intake24-dietician/common/types/theme'
import { Gender, PatientSchema } from '@/schema/patient'
import { useToast } from 'vue-toast-notification'
import { usePatientById } from '@intake24-dietician/portal/queries/usePatients'
import { useUpdatePatient } from '@intake24-dietician/portal/mutations/usePatients'
import { useRoute } from 'vue-router'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import AccountActionMenu from './AccountActionMenu.vue'

// const { t } = useI18n<i18nOptions>()

const route = useRoute()
const patientQuery = usePatientById(route.params['id'] as string)
const updatePatientMutation = useUpdatePatient()

const $toast = useToast()

const form = ref()

const contactDetailsFormValues = ref<ContactDetailsFormValues>({
  firstName: '',
  middleName: '',
  lastName: '',
  avatar: '',
  mobileNumber: '',
  emailAddress: '',
  address: '',
})

const personalDetailsFormValues = ref<PersonalDetailsFormValues>({
  age: 30,
  gender: 'Male',
  weight: 80,
  height: 180,
  additionalNotes: '',
  patientGoal: '',
})

const theme = ref<Theme>('Classic')
const sendAutomatedFeedback = ref<boolean>(false)
const recallFrequency = ref<ReminderConditions>({
  reminderEvery: {
    quantity: 5,
    unit: 'days',
  },
  reminderEnds: {
    type: 'never',
  },
})

const aggregatedData = computed(() => ({
  ...contactDetailsFormValues.value,
  ...personalDetailsFormValues.value,
  theme: theme.value,
  sendAutomatedFeedback: sendAutomatedFeedback.value,
  recallFrequency: recallFrequency.value,
  createdAt: new Date(),
  updatedAt: new Date(),
}))

const isFormValid = computed(() => {
  return PatientSchema.safeParse(aggregatedData.value).success
})

const handleContactDetailsUpdate = (values: ContactDetailsFormValues) => {
  contactDetailsFormValues.value = values
}

const handlePersonalDetailsUpdate = (values: PersonalDetailsFormValues) => {
  personalDetailsFormValues.value = values
}

const handleVisualThemeUpdate = (_theme: Theme) => {
  theme.value = _theme
}

const handleSendAutomatedFeedback = (value: boolean) => {
  sendAutomatedFeedback.value = value
}

const handleRecallFrequencyUpdate = (value: ReminderConditions) => {
  recallFrequency.value = value
}

const handleSubmit = async (): Promise<void> => {
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

    updatePatientMutation.mutate(
      {
        ...aggregatedData.value,
        patientId: Number(route.params['id']),
      },
      {
        onSuccess: () => {
          $toast.success('Patient details updated')
          resolve()
        },
        onError: err => {
          $toast.error(err.response?.data.error.detail ?? DEFAULT_ERROR_MESSAGE)
        },
      },
    )

    resolve()
  })
}

const patient = computed(() => {
  return patientQuery.data.value?.data.data
})

watch(
  () => patientQuery.data.value?.data.data,
  newData => {
    if (!newData) return

    contactDetailsFormValues.value = {
      firstName: newData.patientProfile.firstName,
      middleName: newData.patientProfile.middleName,
      lastName: newData.patientProfile.lastName,
      avatar: newData.patientProfile.avatar ?? getDefaultAvatar(newData.email),
      mobileNumber: newData.patientProfile.mobileNumber,
      emailAddress: newData.email,
      address: newData.patientProfile.address,
    }

    personalDetailsFormValues.value = {
      age: newData.patientProfile.age,
      gender: newData.patientProfile.gender as Gender,
      weight: newData.patientProfile.weight,
      height: newData.patientProfile.height,
      additionalNotes: newData.patientProfile.additionalNotes,
      patientGoal: newData.patientProfile.patientGoal,
    }

    theme.value = newData.patientProfile.theme
    sendAutomatedFeedback.value = newData.patientProfile.sendAutomatedFeedback
    recallFrequency.value = newData.patientProfile.recallFrequency
  },
  { immediate: true },
)
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
  padding-bottom: 0.5rem;
  font-family: Roboto;

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

  &.patient-status {
    color: #555;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }
}
</style>
