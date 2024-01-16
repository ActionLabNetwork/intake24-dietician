<template>
  <div>
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
            :color="patient?.isArchived ? 'neutral' : 'success'"
            :text="patient?.isArchived ? 'Archived' : 'Active'"
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
    <v-form
      v-if="patientQuery.isSuccess"
      ref="form"
      class="mt-8"
      autocomplete="on"
    >
      <div>
        <ContactDetails
          :default-state="patientForm.formValues.value.contactDetailsFormValues"
          mode="Edit"
          :handle-submit="handleSubmit"
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
          class="mt-10"
          :default-state="patientForm.formValues.value.theme"
          @update="patientForm.handleFormUpdate('theme', $event)"
        />
        <SendAutomatedFeedbackToggle
          class="mt-10"
          :default-state="patientForm.formValues.value.sendAutomatedFeedback"
          @update="
            patientForm.handleFormUpdate('sendAutomatedFeedback', $event)
          "
        />
        <UpdateRecallFrequency
          class="mt-10"
          :default-state="patientForm.formValues.value.recallFrequency"
          @update="patientForm.handleFormUpdate('recallFrequency', $event)"
        />
      </div>
      <div>
        <BaseButton type="submit" @click.prevent="handleSubmit">
          Update patient details
        </BaseButton>
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
import ContactDetails, {
  ContactDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import PersonalDetails, {
  PersonalDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import UpdateRecallFrequency from '@intake24-dietician/portal/components/patients/patient-details/UpdateRecallFrequency.vue'
import { Theme } from '@intake24-dietician/common/types/theme'
import { useToast } from 'vue-toast-notification'
import { useUpdatePatient } from '@intake24-dietician/portal/mutations/usePatients'
import { useRoute } from 'vue-router'
import AccountActionMenu from './AccountActionMenu.vue'
import { useForm } from '@/composables/useForm'
import { ReminderCondition } from '@intake24-dietician/common/entities-new/preferences.dto'
import {
  PatientUpdateDto,
  PatientUpdateDtoSchema,
} from '@intake24-dietician/common/entities-new/user.dto'
import BaseButton from '@/components/common/BaseButton.vue'
import { z } from 'zod'
import { usePatientStore } from '@intake24-dietician/portal/stores/patient'

// const { t } = useI18n<i18nOptions>()

const patientStore = usePatientStore()

const route = useRoute()
const patientQuery = computed(() => patientStore.patientQuery)
const updatePatientMutation = useUpdatePatient()

const $toast = useToast()

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
    age: 30,
    gender: 'Male',
    weight: 80,
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
    id: number
    email: string
    patient: Partial<PatientUpdateDto>
  }
>({
  initialValues: formValues,
  schema: z.object({
    id: z.number(),
    email: z.string(),
    patient: PatientUpdateDtoSchema.partial(),
  }),
  $toast: $toast,
  mutationFn: updatePatientMutation.mutateAsync,
  onSuccess: () => {
    $toast.success('Patient details updated successfully')
  },
})

const aggregatedData = computed(() => {
  const { contactDetailsFormValues, personalDetailsFormValues, ...rest } =
    patientForm.formValues.value

  return {
    ...contactDetailsFormValues,
    ...personalDetailsFormValues,
    patientPreference: {
      theme: rest.theme,
      sendAutomatedFeedback: rest.sendAutomatedFeedback,
      reminderCondition: rest.recallFrequency,
      reminderMessage: '',
    },
  }
})

// const isFormValid = computed(() => {
//   return patientForm.isFormValid({
//     id: Number(route.params['patientId']),
//     email: aggregatedData.value.email ?? '',
//     patient: aggregatedData.value,
//   })
// })

const handleSubmit = async (): Promise<void> => {
  return await patientForm.handleSubmit({
    id: Number(route.params['patientId']),
    email: aggregatedData.value.email ?? '',
    patient: aggregatedData.value,
  })
}

const patient = computed(() => {
  return patientQuery.value.data
})

const updateFormValue = <T,>(formValue: T, newValue: T | null | undefined) => {
  return newValue ?? formValue
}

watch(
  () => patientQuery.value.data,
  newData => {
    if (!newData) return

    const contactDetails = patientForm.formValues.value.contactDetailsFormValues
    const personalDetails =
      patientForm.formValues.value.personalDetailsFormValues

    patientForm.formValues.value = {
      contactDetailsFormValues: {
        firstName: updateFormValue(contactDetails.firstName, newData.firstName),
        middleName: updateFormValue(
          contactDetails.middleName,
          newData.middleName,
        ),
        lastName: updateFormValue(contactDetails.lastName, newData.lastName),
        avatar: updateFormValue(contactDetails.avatar, newData.avatar),
        mobileNumber: updateFormValue(
          contactDetails.mobileNumber,
          newData.mobileNumber,
        ),
        email: updateFormValue(contactDetails.email, newData.user.email),
        address: updateFormValue(contactDetails.address, newData.address),
      },
      personalDetailsFormValues: {
        age: updateFormValue(personalDetails.age, newData.age),
        gender: updateFormValue(personalDetails.gender, newData.gender),
        weight: updateFormValue(personalDetails.weight, newData.weight),
        height: updateFormValue(personalDetails.height, newData.height),
        additionalNotes: updateFormValue(
          personalDetails.additionalNotes,
          newData.additionalNotes,
        ),
        patientGoal: updateFormValue(
          personalDetails.patientGoal,
          newData.patientGoal,
        ),
      },
      theme: updateFormValue(
        patientForm.formValues.value.theme,
        newData.patientPreference?.theme,
      ) as Theme,
      sendAutomatedFeedback: updateFormValue(
        patientForm.formValues.value.sendAutomatedFeedback,
        newData.patientPreference?.sendAutomatedFeedback,
      ),
      recallFrequency: {
        reminderEvery: {
          every: updateFormValue(
            patientForm.formValues.value.recallFrequency.reminderEvery.every,
            newData.patientPreference.reminderCondition.reminderEvery.every,
          ),
          unit: updateFormValue(
            patientForm.formValues.value.recallFrequency.reminderEvery.unit,
            newData.patientPreference.reminderCondition.reminderEvery.unit,
          ),
        },
        reminderEnds: updateFormValue(
          patientForm.formValues.value.recallFrequency.reminderEnds,
          newData.patientPreference.reminderCondition.reminderEnds,
        ),
      },
    }
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
.text {
  padding-bottom: 0.5rem;

  &.heading {
    color: #000;
    font-size: 24px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
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
