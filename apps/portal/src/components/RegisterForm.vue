<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div class="wrapper py-15 px-16 d-flex flex-column">
      <div class="pb-16">
        <v-img max-width="10rem" src="../assets/logo.svg" />
      </div>
      <div>
        <h1>{{ messages.title }}</h1>
        <h2>{{ messages.subtitle }}</h2>
      </div>
      <div class="d-flex flex-column mt-16">
        <BaseInput type="text">{{ messages.form.email.label }}</BaseInput>
        <BaseInput
          :type="passwordVisible ? 'text' : 'password'"
          :suffix-icon="
            passwordVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          :handle-icon-click="() => (passwordVisible = !passwordVisible)"
        >
          {{ messages.form.password.label }}
        </BaseInput>
        <BaseInput
          :type="confirmPasswordVisible ? 'text' : 'password'"
          :suffix-icon="
            confirmPasswordVisible ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
          "
          :handle-icon-click="
            () => (confirmPasswordVisible = !confirmPasswordVisible)
          "
        >
          {{ messages.form.confirmPassword.label }}
        </BaseInput>
        <v-btn
          class="text-subtitle-1 w-75 mt-6"
          color="#EE672D"
          size="large"
          variant="flat"
        >
          {{ messages.form.createAccount }}
        </v-btn>
      </div>
    </div>
    <div>
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
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import BaseInput from './form/BaseInput.vue'

// TODO: Migrate this to i18n
const messages = {
  title: 'Welcome back',
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

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
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
