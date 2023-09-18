<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div
      v-if="resetPasswordMutation.data.value === undefined"
      class="wrapper py-15 px-16 d-flex flex-column"
    >
      <div class="pb-16">
        <v-img max-width="10rem" src="@/assets/logo.svg" />
      </div>
      <div>
        <h1>{{ messages.title }}</h1>
        <h2>{{ messages.subtitle }}</h2>
      </div>
      <div v-show="errorAlert" class="pt-10">
        <v-alert
          v-model="errorAlert"
          closable
          type="error"
          title="Registration failed"
          :text="error"
        ></v-alert>
      </div>
      <div class="d-flex flex-column mt-16">
        <v-form v-model="form" @submit.prevent="handleSubmit">
          <!-- New Password -->
          <BaseInput
            :type="passwordVisible ? 'text' : 'password'"
            :placeholder="messages.form.password.placeholder"
            autocomplete="new-password"
            name="password"
            :suffix-icon="
              passwordVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
            "
            :handle-icon-click="() => (passwordVisible = !passwordVisible)"
            :rules="[passwordValidator]"
            :value="password"
            @update="newVal => (password = newVal)"
          >
            {{ messages.form.password.label }}
          </BaseInput>
          <!-- Confirm new password -->
          <BaseInput
            :type="confirmPasswordVisible ? 'text' : 'password'"
            :placeholder="messages.form.confirmPassword.placeholder"
            autocomplete="new-password"
            name="confirmPassword"
            :rules="[
              confirmPwd => confirmPasswordValidator(password, confirmPwd),
            ]"
            :value="confirmPassword"
            :suffix-icon="
              confirmPasswordVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
            "
            :handle-icon-click="
              () => (confirmPasswordVisible = !confirmPasswordVisible)
            "
            @update="newVal => (confirmPassword = newVal)"
          >
            {{ messages.form.confirmPassword.label }}
          </BaseInput>
          <!-- Reset password button -->
          <v-btn
            class="text-subtitle-1 w-75 mt-6"
            color="#EE672D"
            size="large"
            variant="flat"
            type="submit"
            :disabled="!form || resetPasswordMutation.isLoading.value"
            :loading="resetPasswordMutation.isLoading.value"
          >
            {{ messages.form.resetPassword }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="resetPasswordMutation.data.value !== undefined" class="px-16">
      <v-alert
        v-model="successAlert"
        closable
        type="success"
        :title="messages.form.success.title"
        :text="messages.form.success.text"
      ></v-alert>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import BaseInput from '@/components/form/BaseInput.vue'
import { useResetPassword } from '@/mutations/useAuth'
import { passwordValidator, confirmPasswordValidator } from '@/validators/auth'

const props = defineProps<{ token: string }>()

// TODO: Migrate this to i18n
const messages = {
  title: 'Reset your password',
  subtitle:
    'Enter a new password to be used for your Intake24 Dietician account.',
  form: {
    password: {
      label: 'New Password',
      placeholder: '********',
    },
    confirmPassword: {
      label: 'Confirm new password',
      placeholder: '********',
    },
    resetPassword: 'Reset password',
    success: {
      title: 'Your password has been reset successfully.',
      text: 'You can now login with your new password.',
    },
    error: 'Invalid credentials. Please try again with a different one.',
  },
} as const

const resetPasswordMutation = useResetPassword()

const form = ref(null)
const error = ref('')
const successAlert = ref(false)
const errorAlert = ref(false)

// Form fields
const password = ref('')
const confirmPassword = ref('')

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

const handleSubmit = () => {
  const isFormValid = form.value
  if (isFormValid) {
    resetPasswordMutation.mutate(
      {
        password: password.value,
        token: props.token,
      },
      {
        onSuccess() {
          successAlert.value = true
        },
        onError() {
          error.value =
            'Invalid credentials. Please try again with a different one.'
          errorAlert.value = true
        },
      },
    )
  }
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
../validators/auth
