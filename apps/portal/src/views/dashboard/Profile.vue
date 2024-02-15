<template>
  <v-main v-if="isProfileLoading && !profileQuerySucceeded" align="center">
    <v-container>
      <v-progress-circular indeterminate />
    </v-container>
  </v-main>
  <v-main v-else class="wrapper">
    <v-container>
      <BackButton class="mb-5" />
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
            @click.prevent="() => onSubmit().showConfirmDialog()"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </div>
      <v-divider class="my-10"></v-divider>
      <v-form v-if="currentFormData">
        <PersonalDetails :avatar="currentFormData.avatar ?? ''" />
        <ContactDetails
          class="mt-10"
          :email="{
            current: values.currentEmail ?? currentFormData.email,
            new: values.newEmail ?? currentFormData.email,
          }"
        />
        <ShortBio class="mt-16" />
        <div class="mt-16">
          <p class="font-weight-bold">{{ t('profile.form.review.title') }}</p>
          <v-btn
            type="submit"
            color="primary text-capitalize"
            class="mt-3"
            :loading="updateProfileMutation.isPending.value"
            :disabled="!hasFormChanged"
            @click.prevent="() => onSubmit().showConfirmDialog()"
          >
            {{ t('profile.cta') }}
          </v-btn>
        </div>
      </v-form>
      <DialogRouteLeave :unsaved-changes="hasFormChanged" />
      <DialogProfileEdit
        v-model="confirmDialog"
        :on-confirm="() => onSubmit().submit()"
      />
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import DialogRouteLeave from '@intake24-dietician/portal/components/common/DialogRouteLeave.vue'
import BackButton from '@intake24-dietician/portal/components/common/BackButton.vue'
import ContactDetails from '@/components/profile/ContactDetails.vue'
import PersonalDetails from '@/components/profile/PersonalDetails.vue'
import ShortBio from '@/components/profile/ShortBio.vue'
import { useUpdateProfile } from '@/mutations/useAuth'
import { useAuthStore } from '@/stores/auth'
import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import isEqual from 'lodash.isequal'
import { computed } from 'vue'
import { VForm } from 'vuetify/lib/components/index.mjs'
import DialogProfileEdit from './DialogProfileEdit.vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { DieticianCreateDto } from '@intake24-dietician/common/entities-new/user.dto'
import { z } from 'zod'
import cloneDeep from 'lodash.clonedeep'

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

const { values, handleSubmit, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(
    DieticianCreateDto.merge(
      z.object({
        currentEmail: z.string().email(),
        newEmail: z.string().email(),
      }),
    ),
  ),
})

const confirmDialog = ref(false)
const currentFormData = ref<typeof savedFormData.value>(undefined)

const savedFormData = computed(() => {
  if (!savedProfile.value) return undefined
  const { user, ...rest } = savedProfile.value
  return { ...rest, email: user.email }
})

const hasFormChanged = computed<boolean>(() => {
  const initialValues = cloneDeep(meta.value.initialValues)
  const keysToRemove = new Set(['id', 'createdAt', 'updatedAt', 'email'])

  if (!initialValues) return false

  const rest = Object.fromEntries(
    Object.entries(initialValues).filter(([key]) => !keysToRemove.has(key)),
  )

  return !isEqual(rest, values)
})

const onSubmit = () => {
  const showConfirmDialog = () => {
    confirmDialog.value = true
  }

  const submit = handleSubmit(
    values => {
      if (!currentFormData.value) return

      updateProfileMutation.mutate(
        {
          emailAddress: currentFormData.value.email,
          dieticianProfile: values,
        },
        {
          onSuccess: () => {
            $toast.success('Profile updated successfully')
            resetForm({ values })
          },
          onError: () => {
            $toast.error('Failed to update dietician profile')
          },
        },
      )
    },
    () => {},
  )

  return { showConfirmDialog, submit }
}

watch(
  savedFormData,
  () => {
    if (!savedFormData.value) return

    const email = savedFormData.value.email

    currentFormData.value = savedFormData.value
    // setValues(savedFormData.value)
    resetForm({
      values: {
        ...savedFormData.value,
        currentEmail: email,
        newEmail: email,
      },
    })
  },
  { immediate: true },
)
</script>

<style scoped lang="scss">
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
