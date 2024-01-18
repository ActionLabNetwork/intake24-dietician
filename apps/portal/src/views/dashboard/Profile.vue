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
            :disabled="!hasFormChanged"
            @click="handleSubmit"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form
        v-if="currentFormData"
        ref="form"
        @submit.prevent="() => handleSubmit()"
      >
        <PersonalDetails
          :default-state="currentFormData"
          @update="handleFormValueUpdate"
        />
        <ContactDetails
          class="mt-10"
          :default-state="currentFormData"
          @update="handleFormValueUpdate"
        />
        <ShortBio
          class="mt-16"
          :default-state="currentFormData"
          @update="handleFormValueUpdate"
        />
        <div class="mt-16">
          <p class="font-weight-bold">{{ t('profile.form.review.title') }}</p>
          <v-btn
            type="submit"
            color="primary text-capitalize"
            class="mt-3"
            :loading="updateProfileMutation.isPending.value"
            :disabled="!hasFormChanged"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import ContactDetails from '@/components/profile/ContactDetails.vue'
import PersonalDetails from '@/components/profile/PersonalDetails.vue'
import ShortBio from '@/components/profile/ShortBio.vue'
import { useUpdateProfile } from '@/mutations/useAuth'
import { useAuthStore } from '@/stores/auth'
import { i18nOptions } from '@intake24-dietician/i18n/index'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
// import { pick, keys, isEqual } from 'radash'
import isEqual from 'lodash.isequal'
import { computed } from 'vue'
import { VForm } from 'vuetify/lib/components/index.mjs'

onMounted(async () => {
  if (!authStore.profile) {
    await authStore.refetch()
  }
})

// i18n
const { t } = useI18n<i18nOptions>()

// Stores
const authStore = useAuthStore()

const {
  profile: savedProfile,
  isProfileLoading,
  profileQuerySucceeded,
} = storeToRefs(authStore)

// Mutations
const updateProfileMutation = useUpdateProfile()

// Composables
const $toast = useToast()

const savedFormData = computed(() => {
  if (!savedProfile.value) return undefined
  const { user, ...rest } = savedProfile.value
  return { ...rest, email: user.email }
})

const currentFormData = ref<typeof savedFormData.value>(undefined)
watch(savedFormData, () => {
  currentFormData.value = savedFormData.value
})

const hasFormChanged = computed(() => {
  return !isEqual(savedFormData.value, currentFormData.value)
})

const handleFormValueUpdate = (
  newValues: Partial<typeof currentFormData.value>,
) => {
  if (currentFormData.value === undefined) return
  currentFormData.value = { ...currentFormData.value, ...newValues }
}

const handleSubmit = async () => {
  if (!hasFormChanged.value || !currentFormData.value) return
  try {
    await updateProfileMutation.mutateAsync({
      emailAddress: currentFormData.value.email,
      dieticianProfile: currentFormData.value,
    })
    $toast.success('Profile updated successfully')
  } catch {
    $toast.error('Failed to update dietician profile')
  }
}

// Refs
const form = ref()
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
