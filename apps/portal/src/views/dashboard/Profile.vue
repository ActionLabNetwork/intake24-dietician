<template>
  <v-main class="wrapper">
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
            :loading="updateProfileMutation.isLoading.value"
            @click="handleSubmit"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form v-if="user" v-model="form" @submit.prevent="handleSubmit">
        <PersonalDetails
          :user="user"
          :profileFormValues="profileFormValues"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <ContactDetails
          :user="user"
          :profileFormValues="profileFormValues"
          class="mt-10"
          @update="value => handleProfileDetailsUpdate(value)"
        />
        <ShortBio
          class="mt-16"
          :user="user"
          :profileFormValues="profileFormValues"
          @update="value => handleProfileDetailsUpdate(value)"
        />
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
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import PersonalDetails, {
  PersonalDetailsFormValues,
} from '@/components/profile/PersonalDetails.vue'
import ContactDetails, {
  ContactDetailsFormValues,
} from '@/components/profile/ContactDetails.vue'
import ShortBio from '@/components/profile/ShortBio.vue'
import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ShortBioFormValues } from '@/components/profile/ShortBio.vue'
import { useUpdateProfile } from '@/mutations/useAuth'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import { DieticianProfileValues } from '@intake24-dietician/common/types/auth'

const { t } = useI18n<i18nOptions>()

const authStore = useAuthStore()
authStore.getSession()
const { user } = storeToRefs(authStore)

const updateProfileMutation = useUpdateProfile()

const $toast = useToast()

const form = ref(null)
const profileFormValues = ref<DieticianProfileValues>({
  firstName: '',
  middleName: '',
  lastName: '',
  emailAddress: '',
  mobileNumber: '',
  businessNumber: '',
  businessAddress: '',
  shortBio: '',
})

const handleProfileDetailsUpdate = (
  details:
    | PersonalDetailsFormValues
    | ContactDetailsFormValues
    | ShortBioFormValues,
) => {
  profileFormValues.value = { ...profileFormValues.value, ...details }
  console.log({ profileFormValues: profileFormValues.value })
}

const handleSubmit = () => {
  if (!form.value) return
  console.log({ profileFormValues: profileFormValues.value })
  updateProfileMutation.mutate(
    { dieticianProfile: profileFormValues.value },
    {
      onSuccess: () => {
        console.log('success')
        $toast.success('Profile updated successfully')
      },
      onError: () => {
        console.log('error')
      },
    },
  )
}

watch(user, newUser => {
  profileFormValues.value = {
    firstName: newUser?.dieticianProfile.firstName ?? '',
    middleName: newUser?.dieticianProfile.middleName ?? '',
    lastName: newUser?.dieticianProfile.lastName ?? '',
    emailAddress: newUser?.email ?? '',
    mobileNumber: newUser?.dieticianProfile.mobileNumber ?? '',
    businessNumber: newUser?.dieticianProfile.businessNumber ?? '',
    businessAddress: newUser?.dieticianProfile.businessAddress ?? '',
    shortBio: newUser?.dieticianProfile.shortBio ?? '',
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
