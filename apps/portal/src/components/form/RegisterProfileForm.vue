<template>
  <v-container>
    <div
      class="d-flex flex-column flex-sm-row justify-space-between align-center mt-16"
    >
      <div>
        <h1 class="text heading">Let's get you started</h1>
        <h3 class="text subheading">
          Begin by creating your profile. Some of your profile details such as
          your display picture will reflect across the feedbacks you share with
          your patients.
        </h3>
      </div>
    </div>
    <v-divider class="my-10"></v-divider>
    <v-form>
      <PersonalDetails :avatar="currentFormData?.avatar ?? null" />
      <ContactDetails
        class="mt-10"
        :email="{
          current: values.currentEmail ?? currentFormData?.email ?? '',
          new: values.newEmail ?? currentFormData?.email ?? '',
        }"
        :allow-email-change="false"
      />
      <ShortBio class="mt-16" />
      <div class="mt-16">
        <v-btn
          type="submit"
          color="primary text-capitalize"
          class="mt-3"
          :loading="loading"
          :disabled="!hasFormChanged"
          @click.prevent="() => onSubmit().submit()"
        >
          Continue
        </v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script lang="ts" setup>
import ContactDetails from '@/components/profile/ContactDetails.vue'
import PersonalDetails from '@/components/profile/PersonalDetails.vue'
import ShortBio from '@/components/profile/ShortBio.vue'
import { useAuthStore } from '@/stores/auth'
// import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
// import { useI18n } from 'vue-i18n'
// import { useToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'
import isEqual from 'lodash.isequal'
import { computed } from 'vue'
import { VForm } from 'vuetify/lib/components/index.mjs'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { DieticianCreateDto } from '@intake24-dietician/common/entities-new/user.dto'
import { z } from 'zod'
import cloneDeep from 'lodash.clonedeep'

const props = defineProps<{ email: string; loading: boolean }>()
const emit = defineEmits<{
  submit: [values: DieticianCreateDto]
}>()

onMounted(async () => {
  if (!authStore.profile) {
    await authStore.refetch()
  }
})

// i18n
// const { t } = useI18n<i18nOptions>()

// Stores
const authStore = useAuthStore()

const { profile: savedProfile } = storeToRefs(authStore)

// Composables
// const $toast = useToast()

const { values, handleSubmit, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(
    DieticianCreateDto.merge(
      z.object({
        currentEmail: z.string().email(),
        newEmail: z.string().email(),
      }),
    ),
  ),
  initialValues: {
    currentEmail: '',
    newEmail: '',
    firstName: '',
    middleName: '',
    lastName: '',
    avatar: '',
    mobileNumber: '',
    businessNumber: '',
    businessAddress: '',
    shortBio: '',
  },
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
    async values => {
      emit('submit', values)
    },
    ({ values, errors, results }) => {
      console.log({ values, errors, results })
    },
  )

  return { showConfirmDialog, submit }
}

watch(
  savedFormData,
  () => {
    if (!savedFormData.value) return

    const email = savedFormData.value.email

    currentFormData.value = savedFormData.value
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

watch(
  () => props.email,
  newEmail => {
    resetForm({
      values: {
        ...values,
        currentEmail: newEmail,
        newEmail: newEmail,
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
