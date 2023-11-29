<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div
      v-if="forgotPasswordMutation.data.value === undefined"
      class="wrapper py-15 px-16 d-flex flex-column"
    >
      <div class="pb-16">
        <v-img class="pb-16" max-width="10rem" src="@/assets/logo.svg" />
      </div>
      <div>
        <h1>{{ t('forgotPassword.title') }}</h1>
        <h2>{{ t('forgotPassword.subtitle') }}</h2>
      </div>
      <div v-show="errorAlert" class="pt-10">
        <v-alert
          v-model="errorAlert"
          closable
          type="error"
          :title="t('forgotPassword.form.error.invalidEmail')"
          :text="error"
        ></v-alert>
      </div>
      <div class="d-flex flex-column mt-16">
        <v-form
          v-model="form"
          class="d-flex flex-column justify-center"
          @submit.prevent="handleSubmit"
        >
          <!-- Email -->
          <BaseInput
            type="text"
            :placeholder="t('forgotPassword.form.email.placeholder')"
            autocomplete="username"
            name="email"
            :rules="[emailValidator]"
            :value="email"
            @update="newVal => (email = newVal)"
          >
            {{ t('forgotPassword.form.email.label') }}
          </BaseInput>
          <v-btn
            class="text-subtitle-1 w-75 mt-6 mx-auto mx-md-0"
            color="#EE672D"
            size="large"
            variant="flat"
            type="submit"
            :disabled="!form || forgotPasswordMutation.isLoading.value"
            :loading="forgotPasswordMutation.isLoading.value"
          >
            {{ t('forgotPassword.form.resetPassword') }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="forgotPasswordMutation.data.value === undefined">
      <div class="text-center">
        {{ t('forgotPassword.form.createAccount.label') }}
        <router-link
          to="register"
          class="text-decoration-none text-primary font-weight-bold"
        >
          {{ t('forgotPassword.form.createAccount.link') }}
        </router-link>
      </div>
    </div>
    <div v-else class="px-16">
      <v-alert
        v-model="successAlert"
        closable
        type="success"
        :title="t('forgotPassword.form.success.title')"
        :text="t('forgotPassword.form.success.text')"
      ></v-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import BaseInput from '@/components/form/BaseInput.vue'

import { emailValidator } from '@/validators/auth'
import { useForgotPassword } from '@/mutations/useAuth'

import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'
import { useForm } from '@intake24-dietician/portal/composables/useForm'
import { ForgotPasswordSchema } from '@intake24-dietician/portal/schema/auth'

const { t } = useI18n<i18nOptions>()

const forgotPasswordMutation = useForgotPassword()

const form = ref(null)
const error = ref('')
const successAlert = ref(false)
const errorAlert = ref(false)

// Form fields
const email = ref('')

const forgotPasswordForm = useForm<string, { email: string }>({
  initialValues: '',
  schema: ForgotPasswordSchema.zodSchema,
  $toast: undefined,
  mutationFn: forgotPasswordMutation.mutateAsync,
  onSuccess: () => {
    successAlert.value = true
  },
  onError: () => {
    error.value = 'Invalid email. Please try again'
    errorAlert.value = true
  },
})

const handleSubmit = () => {
  forgotPasswordForm.handleSubmit(
    { email: email.value },
    { email: email.value },
  )
}
</script>

<style scoped lang="scss">
$base-color: #000;
h1 {
  color: $base-color;
  font-size: 1.5rem;
  font-weight: 600;
}

h2 {
  color: $base-color;
  font-size: 0.875rem;
  font-weight: 400;
}

.wrapper {
  width: 90%;
}
</style>
