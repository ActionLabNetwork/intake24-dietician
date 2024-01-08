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
            :loading="updateProfileMutation.isPending.value"
            @click="handleSubmit"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form v-if="profile" ref="form" @submit.prevent="() => handleSubmit()">
        <PersonalDetails
          v-if="personalDetailsFormValues"
          :default-state="personalDetailsFormValues"
          :email="profile.user.email"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <ContactDetails
          v-if="contactDetailsFormValues"
          class="mt-10"
          :default-state="contactDetailsFormValues"
          :email="profile.user.email"
          :handleSubmit="handleSubmit"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <ShortBio
          v-if="shortBioFormValues"
          class="mt-16"
          :user="profile"
          :default-state="shortBioFormValues"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <div class="mt-16">
          <p class="font-weight-bold">{{ t('profile.form.review.title') }}</p>
          <v-btn
            type="submit"
            color="primary text-capitalize"
            class="mt-3"
            :loading="updateProfileMutation.isPending.value"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
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
// import { pick, keys, isEqual } from 'radash'
import { VForm } from 'vuetify/lib/components/index.mjs'
import {
  DieticianCreateDto,
  DieticianUpdateDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import { useForm } from '@intake24-dietician/portal/composables/useForm'
import { useQueryClient } from '@tanstack/vue-query'

// Types
type ProfileFormValues = Partial<DieticianCreateDto> & { emailAddress: string }

const defaultValue = {
  firstName: '',
  middleName: '',
  lastName: '',
  emailAddress: '',
  mobileNumber: '',
  businessNumber: '',
  businessAddress: '',
  shortBio: '',
  avatar: null,
}

onMounted(async () => {
  await authStore.refetch()
  await queryClient.invalidateQueries()
  await queryClient.refetchQueries()
})

// i18n
const { t } = useI18n<i18nOptions>()

// Stores
const authStore = useAuthStore()

const { profile, isProfileLoading, profileQuerySucceeded } =
  storeToRefs(authStore)

// Mutations
const updateProfileMutation = useUpdateProfile()
const uploadAvatarMutation = useUploadAvatar()

// Composables
const $toast = useToast()
const queryClient = useQueryClient()

// Refs
const form = ref()
const profileForm = useForm<
  Partial<ProfileFormValues>,
  { emailAddress: string; dieticianProfile: Partial<DieticianCreateDto> }
>({
  initialValues: defaultValue,
  schema: DieticianUpdateDto,
  $toast,
  mutationFn: updateProfileMutation.mutateAsync,
  onSuccess: () => {
    $toast.success('Profile updated successfully')
  },
  onError: () => {
    console.log('Failed to update dietician profile')
  },
})

const profileFormValues = ref<DieticianCreateDto & { emailAddress: string }>(
  defaultValue,
)

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

  const { emailAddress, ...dieticianProfile } = profileFormValues.value

  profileForm.handleSubmit(profileFormValues.value, {
    emailAddress,
    dieticianProfile,
  })

  if (profileFormValues.value.avatar) {
    uploadAvatarMutation.mutate({
      avatarBase64:
        profileFormValues.value.avatar ?? profile.value?.avatar ?? '',
    })
  }
}

watch(
  profile,
  // eslint-disable-next-line complexity
  newUser => {
    if (newUser) {
      profileFormValues.value = {
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        emailAddress: newUser.user.email,
        mobileNumber: newUser.mobileNumber ?? '',
        businessNumber: newUser.businessNumber ?? '',
        businessAddress: newUser.businessAddress ?? '',
        shortBio: newUser.shortBio ?? '',
        avatar: newUser.avatar ?? null,
      }

      personalDetailsFormValues.value = {
        firstName: newUser.firstName,
        middleName: newUser.middleName,
        lastName: newUser.lastName,
        avatar: newUser.avatar ?? '',
      }

      contactDetailsFormValues.value = {
        email: newUser.user.email ?? '',
        mobileNumber: newUser.mobileNumber ?? '',
        businessNumber: newUser.businessNumber ?? '',
        businessAddress: newUser.businessAddress ?? '',
      }

      shortBioFormValues.value = {
        shortBio: newUser.shortBio ?? '',
      }
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
