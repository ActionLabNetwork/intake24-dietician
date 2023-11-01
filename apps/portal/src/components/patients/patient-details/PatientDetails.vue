<template>
  <v-main v-if="isProfileLoading" align="center">
    <v-container>
      <v-progress-circular indeterminate></v-progress-circular>
    </v-container>
  </v-main>
  <div v-else class="wrapper">
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center"
    >
      <div>
        <h1 class="text heading">Patient details</h1>
        <h3 class="text subheading">
          {{ t('profile.subtitle') }}
        </h3>
      </div>
      <div>
        <v-btn
          type="submit"
          color="primary text-capitalize"
          class="mt-3 mt-sm-0"
          :loading="updateProfileMutation.isLoading.value"
          @click="handleSubmit"
        >
          {{ t('profile.cta') }}
        </v-btn>
      </div>
    </div>
    <v-divider class="my-10"></v-divider>
    <v-form v-if="user" ref="form" @submit.prevent="handleSubmit">
      <!-- <ContactDetails />
        <PersonalDetails class="mt-10" /> -->
      <div class="mt-16">
        <p class="font-weight-bold">{{ t('profile.form.review.title') }}</p>
        <v-btn
          type="submit"
          color="primary text-capitalize"
          class="mt-3"
          :loading="updateProfileMutation.isLoading.value"
        >
          {{ t('profile.cta') }}
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useUpdateProfile } from '@/mutations/useAuth'
import 'vue-toast-notification/dist/theme-sugar.css'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { usePatientDetails } from '@intake24-dietician/portal/queries/useAuth'

const { t } = useI18n<i18nOptions>()

const authStore = useAuthStore()
const { user, isProfileLoading } = storeToRefs(authStore)

const patientDetailsQuery = usePatientDetails()
const updateProfileMutation = useUpdateProfile()

// const $toast = useToast()

const form = ref()

// const handleProfileDetailsUpdate = (
//   details: PersonalDetailsFormValues | ShortBioFormValues,
// ) => {
//   profileFormValues.value = { ...profileFormValues.value, ...details }
// }

const handleSubmit = async (): Promise<void> => {
  // await form.value.validate()
  // const errors = form.value.errors
  // return new Promise((resolve, reject) => {
  //   if (errors.length > 0) {
  //     reject(new Error('Form validation failed'))
  //     return
  //   }
  //   updateProfileMutation.mutate(
  //     {
  //       dieticianProfile: {
  //         ...profileFormValues.value,
  //         avatar: '',
  //       },
  //     },
  //     {
  //       onSuccess: () => {
  //         $toast.success('Profile updated successfully')
  //         resolve()
  //       },
  //       onError: () => {
  //         reject(new Error('Profile update failed'))
  //       },
  //     },
  //   )
  //   if (profileFormValues.value.avatar) {
  //     uploadAvatarMutation.mutate({
  //       avatarBase64:
  //         profileFormValues.value.avatar ??
  //         user.value?.dieticianProfile.avatar ??
  //         '',
  //     })
  //   }
  // })
}

// const disableSubmitButton = computed(() => {
//   const errors: any[] = form.value?.['errors']

//   if (errors?.length > 0) return true
//   if (!user.value) return true

//   const hasBeenUpdatedSinceCreation =
//     user.value.dieticianProfile.createdAt !==
//     user.value.dieticianProfile.updatedAt

//   const hasBeenUpdated = !isEqual(profileFormValues.value, {
//     ...pick(
//       user.value?.patientProfile,
//       keys(profileFormValues.value) as (keyof PatientProfileValues)[],
//     ),
//     emailAddress: user.value?.email,
//   })

//   return !hasBeenUpdated || (!hasBeenUpdatedSinceCreation && !hasBeenUpdated)
// })

watch(
  () => patientDetailsQuery.data,
  newUser => {
    const user = newUser.value?.data.data.user
    profileFormValues.value = {
      firstName: user?.patientProfile.firstName ?? '',
      middleName: user?.patientProfile.middleName ?? '',
      lastName: user?.patientProfile.lastName ?? '',
      emailAddress: user?.patientProfile.emailAddress ?? '',
      mobileNumber: user?.patientProfile.mobileNumber ?? '',
      address: user?.patientProfile.address ?? '',
      avatar: user?.patientProfile.avatar ?? null,
      createdAt: user?.patientProfile.createdAt ?? new Date(),
      updatedAt: user?.patientProfile.updatedAt ?? new Date(),
    }
  },
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
  max-width: 75%;
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
