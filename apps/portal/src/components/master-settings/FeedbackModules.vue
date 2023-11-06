<template>
  <div class="wrapper">
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center mt-12"
      >
        <div>
          <h1 class="text heading">Feedback module setup</h1>
          <h3 class="text subheading">
            Choose guidelines appropriate to your country of practise, a visual
            theme for your patients, different modules important to you, and, if
            necessary, tailor the feedback messages.
          </h3>
        </div>
        <div class="alert-text">
          <div>
            <div class="d-flex align-center">
              <div>
                <v-icon icon="mdi-alert-outline" size="large" start />
              </div>
              <div>
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
      <v-divider class="my-10"></v-divider>
      <v-form ref="form">
        <div>
          <v-row>
            <v-col>
              <p class="text section-heading font-weight-medium">
                Country and visual theme selection
              </p>
              <div class="ml-5 mt-5">
                <div class="d-flex justify-start align-start">
                  <div>
                    <div>
                      <div class="text section-heading-2">
                        Enter the survey ID linked with guideline specific to
                        your country of practice provided to you by your admin
                      </div>
                      <div class="text section-subheading">
                        Selected country is linked with the food base & dietary
                        guidelines which will be used for patient recall &
                        feedback provision.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col>
              <div class="survey-id-input">
                <BaseInput type="text">
                  Intake24 Survey ID
                  <span class="text-primary">(required)</span>
                </BaseInput>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="mt-5 ml-5">
                <div class="d-flex justify-start align-start">
                  <div>
                    <div>
                      <div class="text section-heading-2">
                        Select a theme relevant for your patients
                      </div>
                      <div class="text section-subheading">
                        Select a theme that is relevant for your patients in
                        general. You can change the theme specific to a patient
                        from patient information page.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col>
              <VisualThemeSelector
                :default-state="theme"
                hide-label
                class="mt-5"
                @update="handleVisualThemeUpdate"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="mt-5">
                <div class="d-flex justify-start align-start">
                  <div>
                    <div>
                      <div class="text section-heading">
                        Send patient automated feedback after every recall
                      </div>
                      <div class="text section-subheading">
                        Every time a patient completes their recall, an
                        automated feedback based on their recall data and
                        pre-defined feedbacks will be shared with them on their
                        email address
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
            <v-col>
              <SendAutomatedFeedbackToggle
                :default-state="sendAutomatedFeedback"
                hide-label
                @update="handleSendAutomatedFeedback"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <div class="mt-5">
                <div class="d-flex justify-start align-start">
                  <div>
                    <div>
                      <div class="text section-heading">
                        Module selection and feedback personalisation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
        <div class="mt-10">
          <p class="font-weight-medium">Review and save changes</p>
          <div class="text subheading">
            You have made changes to the master module setup. Review and confirm
            the changes before you proceed with adding patients or reviewing
            recall feedback
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
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import { ContactDetailsFormValues } from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import { PersonalDetailsFormValues } from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import { ReminderConditions } from '@intake24-dietician/common/types/reminder'
import { Theme } from '@intake24-dietician/common/types/theme'
import { PatientSchema } from '@/schema/patient'
import { useAddPatient } from '@intake24-dietician/portal/mutations/usePatients'
import { useToast } from 'vue-toast-notification'
import { DEFAULT_ERROR_MESSAGE } from '@/constants/index'
import BaseInput from '@/components/form/BaseInput.vue'
import router from '@intake24-dietician/portal/router'
// const { t } = useI18n<i18nOptions>()

const $toast = useToast()
const addPatientMutation = useAddPatient()

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
  age: 20,
  gender: 'Male',
  weight: 70,
  height: 170,
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

const handleVisualThemeUpdate = (_theme: Theme) => {
  theme.value = _theme
}

const handleSendAutomatedFeedback = (value: boolean) => {
  sendAutomatedFeedback.value = value
}

const handleSubmit = async () => {
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

    addPatientMutation.mutate(aggregatedData.value, {
      onSuccess: () => {
        $toast.success('Patient added to records')
        resolve('Patient added to records')
        router.push('/dashboard/my-patients')
      },
      onError: err => {
        $toast.error(err.response?.data.error.detail ?? DEFAULT_ERROR_MESSAGE)
      },
    })
  })
}
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
