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
import ContactDetails, {
  ContactDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import PersonalDetails, {
  PersonalDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
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
import AccountActionMenu from './AccountActionMenu.vue'
import { useForm } from '@/composables/useForm'
import { PatientProfileValues } from '@intake24-dietician/common/types/auth'

// const { t } = useI18n<i18nOptions>()

const route = useRoute()
const patientQuery = usePatientById(route.params['id'] as string)
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
    emailAddress: '',
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
  recallFrequency: ref<ReminderConditions>({
    reminderEvery: {
      quantity: 5,
      unit: 'days',
    },
    reminderEnds: {
      type: 'never',
    },
  }),
})

const patientForm = useForm<
  typeof formValues,
  PatientProfileValues & { patientId: number }
>({
  initialValues: formValues,
  schema: PatientSchema,
  $toast: $toast,
  mutationFn: updatePatientMutation.mutateAsync,
})

const aggregatedData = computed(() => {
  const { contactDetailsFormValues, personalDetailsFormValues, ...rest } =
    patientForm.formValues.value

  return {
    ...contactDetailsFormValues,
    ...personalDetailsFormValues,
    ...rest,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})

const isFormValid = computed(() => {
  return patientForm.isFormValid(aggregatedData.value)
})

const handleSubmit = async (): Promise<void> => {
  return await patientForm.handleSubmit(aggregatedData.value, {
    ...aggregatedData.value,
    patientId: Number(route.params['id']),
  })
}

const patient = computed(() => {
  return patientQuery.data.value?.data.data
})

watch(
  () => patientQuery.data.value?.data.data,
  newData => {
    if (!newData) return

    const updateFormValue = <T,>(
      formValue: T,
      newValue: T | null | undefined,
    ) => {
      return newValue ?? formValue
    }

    const contactDetails = patientForm.formValues.value.contactDetailsFormValues
    const personalDetails =
      patientForm.formValues.value.personalDetailsFormValues

    patientForm.formValues.value = {
      contactDetailsFormValues: {
        firstName: updateFormValue(
          contactDetails.firstName,
          newData.patientProfile?.firstName,
        ),
        middleName: updateFormValue(
          contactDetails.middleName,
          newData.patientProfile?.middleName,
        ),
        lastName: updateFormValue(
          contactDetails.lastName,
          newData.patientProfile?.lastName,
        ),
        avatar: updateFormValue(
          contactDetails.avatar,
          newData.patientProfile?.avatar,
        ),
        mobileNumber: updateFormValue(
          contactDetails.mobileNumber,
          newData.patientProfile?.mobileNumber,
        ),
        emailAddress: updateFormValue(
          contactDetails.emailAddress,
          newData.email,
        ),
        address: updateFormValue(
          contactDetails.address,
          newData.patientProfile?.address,
        ),
      },
      personalDetailsFormValues: {
        age: updateFormValue(personalDetails.age, newData.patientProfile?.age),
        gender: updateFormValue(
          personalDetails.gender,
          newData.patientProfile?.gender,
        ) as Gender,
        weight: updateFormValue(
          personalDetails.weight,
          newData.patientProfile?.weight,
        ),
        height: updateFormValue(
          personalDetails.height,
          newData.patientProfile?.height,
        ),
        additionalNotes: updateFormValue(
          personalDetails.additionalNotes,
          newData.patientProfile?.additionalNotes,
        ),
        patientGoal: updateFormValue(
          personalDetails.patientGoal,
          newData.patientProfile?.patientGoal,
        ),
      },
      theme: updateFormValue(
        patientForm.formValues.value.theme,
        newData.patientProfile?.patientPreferences?.theme,
      ) as Theme,
      sendAutomatedFeedback: updateFormValue(
        patientForm.formValues.value.sendAutomatedFeedback,
        newData.patientProfile?.patientPreferences?.sendAutomatedFeedback,
      ),
      recallFrequency: {
        reminderEvery: {
          quantity: updateFormValue(
            patientForm.formValues.value.recallFrequency.reminderEvery.quantity,
            newData.patientProfile?.patientPreferences?.recallFrequency
              ?.quantity,
          ),
          unit: updateFormValue(
            patientForm.formValues.value.recallFrequency.reminderEvery.unit,
            newData.patientProfile?.patientPreferences?.recallFrequency?.unit,
          ),
        },
        reminderEnds: updateFormValue(
          patientForm.formValues.value.recallFrequency.reminderEnds,
          newData.patientProfile?.patientPreferences?.recallFrequency?.end,
        ),
      },
    }
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
