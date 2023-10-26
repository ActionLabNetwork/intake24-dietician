<template>
  <div class="wrapper">
    <v-container>
      <div>
        <v-breadcrumbs :items="breadcrumbItems" class="pa-0">
          <template v-slot:divider>
            <v-icon icon="mdi-chevron-right"></v-icon>
          </template>
        </v-breadcrumbs>
        <v-btn
          prepend-icon="mdi-chevron-left"
          flat
          class="text-none px-0 mt-10"
          variant="text"
        >
          Back to patient list
        </v-btn>
      </div>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center mt-12"
      >
        <div>
          <h1 class="text heading">New patient information</h1>
          <h3 class="text subheading">
            Your new patient information strength is
            <span class="text-decoration-underline font-weight-medium">
              Basic
            </span>
          </h3>
        </div>
        <div>
          <v-btn type="submit" color="primary text-none" class="mt-3 mt-sm-0">
            Add patients to records
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <div>
        <ContactDetails
          :default-state="contactDetailsFormValues"
          @update="handleContactDetailsUpdate"
        />
        <PersonalDetails
          :default-state="personalDetailsFormValues"
          class="mt-16"
          @update="handlePersonalDetailsUpdate"
        />
        <VisualThemeSelector class="mt-10" />
        <SendAutomatedFeedbackToggle class="mt-10" />
        <UpdateRecallFrequency class="mt-10" />
      </div>
      <div>
        <p class="font-weight-medium">
          Review and add new patient to the records
        </p>
        <v-btn color="primary" class="text-none mt-4">
          Add patient to records
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import { i18nOptions } from '@intake24-dietician/i18n/index'
// import { useI18n } from 'vue-i18n'
import 'vue-toast-notification/dist/theme-sugar.css'
import ContactDetails, {
  ContactDetailsFormValues,
} from '@intake24-dietician/portal/components/patients/patient-details/ContactDetails.vue'
import PersonalDetails from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import { PersonalDetailsFormValues } from '@intake24-dietician/portal/components/patients/patient-details/PersonalDetails.vue'
import VisualThemeSelector from '@intake24-dietician/portal/components/patients/patient-details/VisualThemeSelector.vue'
import SendAutomatedFeedbackToggle from '@intake24-dietician/portal/components/patients/patient-details/SendAutomatedFeedbackToggle.vue'
import UpdateRecallFrequency from '@intake24-dietician/portal/components/patients/patient-details/UpdateRecallFrequency.vue'
// const { t } = useI18n<i18nOptions>()

const breadcrumbItems = ref([
  {
    title: 'My Patients',
    disabled: false,
    href: '/dashboard/my-patients',
  },
  {
    title: 'Add new patient',
    disabled: false,
    href: '/dashboard/add-patient',
  },
])

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
  age: '20',
  gender: '',
  weight: '70',
  height: '170',
  additionalNotes: '',
  patientGoal: '',
})

const handleContactDetailsUpdate = (values: ContactDetailsFormValues) => {
  contactDetailsFormValues.value = values
  console.log({ values })
}

const handlePersonalDetailsUpdate = (values: PersonalDetailsFormValues) => {
  personalDetailsFormValues.value = values
  console.log({ values })
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
