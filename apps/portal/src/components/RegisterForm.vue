<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div
      v-if="registerMutation.data.value === undefined"
      class="wrapper py-15 px-16 d-flex flex-column"
    >
      <div class="pb-16">
        <v-img max-width="10rem" src="../assets/logo.svg" />
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
          <!-- Email -->
          <BaseInput
            type="text"
            :placeholder="messages.form.email.placeholder"
            autocomplete="username"
            name="email"
            :rules="[emailValidator]"
            :value="email"
            @update="newVal => (email = newVal)"
            >{{ messages.form.email.label }}
          </BaseInput>
          <!-- Password -->
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
          <!-- Confirm password -->
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
          <!-- Create account button -->
          <v-btn
            class="text-subtitle-1 w-75 mt-6"
            color="#EE672D"
            size="large"
            variant="flat"
            type="submit"
            :disabled="!form || registerMutation.isLoading.value"
            :loading="registerMutation.isLoading.value"
          >
            {{ messages.form.createAccount }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="registerMutation.data.value === undefined">
      <div class="text-center">
        {{ messages.form.login.label }}
        <router-link
          to="login"
          class="text-decoration-none text-primary font-weight-bold"
        >
          {{ messages.form.login.link }}
        </router-link>
      </div>
    </div>
    <div v-if="registerMutation.data.value !== undefined">
      <h1 class="px-16">Welcome</h1>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import BaseInput from './form/BaseInput.vue'
import { useRegister } from '../mutations/useAuth'
import {
  emailValidator,
  passwordValidator,
  confirmPasswordValidator,
} from '../validators/auth'

// TODO: Migrate this to i18n
const messages = {
  title: "Let's create your account",
  subtitle: 'Signup to gain access to Intake24 tool',
  form: {
    email: {
      label: 'Work email*',
      placeholder: 'name@email.com',
    },
    password: {
      label: 'Password',
      placeholder: '********',
    },
    confirmPassword: {
      label: 'Confirm password',
      placeholder: '********',
    },
    createAccount: 'Create Account',
    login: {
      label: 'Already have an account?',
      link: 'Log in',
    },
  },
} as const

const registerMutation = useRegister()

const form = ref(null)
const error = ref('')
const errorAlert = ref(false)

// Form fields
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

const handleSubmit = () => {
  const isFormValid = form.value
  if (isFormValid) {
    registerMutation.mutate(
      {
        email: email.value,
        password: password.value,
      },
      {
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
