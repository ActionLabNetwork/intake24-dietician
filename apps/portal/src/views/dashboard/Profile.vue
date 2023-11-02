<template>
  <v-main v-if="isProfileLoading && !profileQuerySucceeded" align="center">
    <v-container>
      <v-progress-circular indeterminate />
    </v-container>
  </v-main>
  <v-main v-else class="wrapper">
    <v-container>
      <div
        class="d-flex flex-column flex-sm-row justify-space-between align-center"
      >
        <div>
          <h1 class="text heading">{{ t('profile.title') }}</h1>
          <h3 class="text subheading">
            {{ t('profile.subtitle') }}
          </h3>
        </div>
        <div>
          <v-btn
            type="submit"
            color="primary text-capitalize"
            class="mt-3 mt-sm-0"
            :disabled="disableSubmitButton"
            :loading="updateProfileMutation.isLoading.value"
            @click="handleSubmit"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form v-if="user" ref="form" @submit.prevent="handleSubmit">
        <PersonalDetails
          v-if="personalDetailsFormValues"
          :default-state="personalDetailsFormValues"
          :email="user.email"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <ContactDetails
          v-if="contactDetailsFormValues"
          class="mt-10"
          :default-state="contactDetailsFormValues"
          :email="user.email"
          :handleSubmit="handleSubmit"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <ShortBio
          v-if="shortBioFormValues"
          class="mt-16"
          :user="user"
          :default-state="shortBioFormValues"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <div class="mt-16">
          <p class="font-weight-bold">{{ t('profile.form.review.title') }}</p>
          <v-btn
            type="submit"
            color="primary text-capitalize"
            class="mt-3"
            :disabled="disableSubmitButton"
            :loading="updateProfileMutation.isLoading.value"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import PersonalDetails, {
  PersonalDetailsFormValues,
} from '@/components/profile/PersonalDetails.vue'
import ContactDetails, {
  ContactDetailsFormValues,
} from '@/components/profile/ContactDetails.vue'
import ShortBio, { ShortBioFormValues } from '@/components/profile/ShortBio.vue'
import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { useUpdateProfile, useUploadAvatar } from '@/mutations/useAuth'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DieticianProfileValues } from '@intake24-dietician/common/types/auth'
import { pick, keys, isEqual } from 'radash'
import { VForm } from 'vuetify/lib/components/index.mjs'

const { t } = useI18n<i18nOptions>()

const authStore = useAuthStore()
const { user, isProfileLoading, profileQuerySucceeded } = storeToRefs(authStore)

const updateProfileMutation = useUpdateProfile()
const uploadAvatarMutation = useUploadAvatar()

const $toast = useToast()

const form = ref()
const profileFormValues = ref<DieticianProfileValues>({
  firstName: '',
  middleName: '',
  lastName: '',
  emailAddress: '',
  mobileNumber: '',
  businessNumber: '',
  businessAddress: '',
  shortBio: '',
  avatar: null,
  createdAt: new Date(),
  updatedAt: new Date(),
})

const personalDetailsFormValues = ref<PersonalDetailsFormValues>()
const contactDetailsFormValues = ref<ContactDetailsFormValues>()
const shortBioFormValues = ref<ShortBioFormValues>()

const handleProfileDetailsUpdate = (
  details:
    | PersonalDetailsFormValues
    | ContactDetailsFormValues
    | ShortBioFormValues,
) => {
  profileFormValues.value = { ...profileFormValues.value, ...details }
}

const handleSubmit = async (): Promise<void> => {
  await form.value.validate()
  const errors = form.value.errors

  return new Promise((resolve, reject) => {
    if (errors.length > 0) {
      reject(new Error('Form validation failed'))
      return
    }

    updateProfileMutation.mutate(
      {
        dieticianProfile: {
          ...profileFormValues.value,
          avatar: '',
        },
      },
      {
        onSuccess: () => {
          $toast.success('Profile updated successfully')
          resolve()
        },
        onError: () => {
          reject(new Error('Profile update failed'))
        },
      },
    )

    if (profileFormValues.value.avatar) {
      uploadAvatarMutation.mutate({
        avatarBase64:
          profileFormValues.value.avatar ??
          user.value?.dieticianProfile.avatar ??
          '',
      })
    }
  })
}

const disableSubmitButton = computed(() => {
  const errors: any[] = form.value?.['errors']

  if (errors?.length > 0) return true
  if (!user.value) return true

  const hasBeenUpdatedSinceCreation =
    user.value.dieticianProfile.createdAt !==
    user.value.dieticianProfile.updatedAt

  const hasBeenUpdated = !isEqual(profileFormValues.value, {
    ...pick(
      user.value?.dieticianProfile,
      keys(profileFormValues.value) as (keyof DieticianProfileValues)[],
    ),
    emailAddress: user.value?.email,
  })

  return !hasBeenUpdated || (!hasBeenUpdatedSinceCreation && !hasBeenUpdated)
})

// eslint-disable-next-line complexity
watch(user, newUser => {
  if (newUser) {
    profileFormValues.value = {
      firstName: newUser.dieticianProfile.firstName ?? '',
      middleName: newUser.dieticianProfile.middleName ?? '',
      lastName: newUser.dieticianProfile.lastName ?? '',
      emailAddress: newUser.email ?? '',
      mobileNumber: newUser.dieticianProfile.mobileNumber ?? '',
      businessNumber: newUser.dieticianProfile.businessNumber ?? '',
      businessAddress: newUser.dieticianProfile.businessAddress ?? '',
      shortBio: newUser.dieticianProfile.shortBio ?? '',
      avatar: newUser.dieticianProfile.avatar ?? null,
      createdAt: newUser.dieticianProfile.createdAt ?? new Date(),
      updatedAt: newUser.dieticianProfile.updatedAt ?? new Date(),
    }

    personalDetailsFormValues.value = {
      firstName: newUser.dieticianProfile.firstName ?? '',
      middleName: newUser.dieticianProfile.middleName ?? '',
      lastName: newUser.dieticianProfile.lastName ?? '',
      avatar: newUser.dieticianProfile.avatar ?? '',
    }

    contactDetailsFormValues.value = {
      emailAddress: newUser.email ?? '',
      mobileNumber: newUser.dieticianProfile.mobileNumber ?? '',
      businessNumber: newUser.dieticianProfile.businessNumber ?? '',
      businessAddress: newUser.dieticianProfile.businessAddress ?? '',
    }

    shortBioFormValues.value = {
      shortBio: newUser.dieticianProfile.shortBio ?? '',
    }
  }
})
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
