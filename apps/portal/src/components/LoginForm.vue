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
        <BaseInput>{{ messages.form.email.label }}</BaseInput>
        <BaseInput>{{ messages.form.password.label }}</BaseInput>
        <div
          class="d-flex flex-column flex-lg-row align-center justify-space-between"
        >
          <div>
            <v-switch
              class="d-flex justify-center"
              :label="messages.form.keepLoggedIn"
              color="success"
            />
          </div>
          <div>
            {{ messages.form.forgotIdOrPwd }}
          </div>
        </div>
        <v-btn
          class="text-subtitle-1 w-75 mt-6"
          color="#EE672D"
          size="large"
          variant="flat"
        >
          {{ messages.form.login }}
        </v-btn>
      </div>
    </div>
    <div>
      <div class="text-center">
        {{ messages.form.createAccount.label }}
        <router-link
          to="register"
          class="text-decoration-none text-primary font-weight-bold"
        >
          {{ messages.form.createAccount.link }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseInput from './form/BaseInput.vue'

// TODO: Migrate this to i18n
const messages = {
  title: 'Welcome back',
  subtitle: 'Login to your Intake24 clinical tool',
  form: {
    email: {
      label: 'Log in with your registered email address',
      placeholder: 'Enter your email address',
    },
    password: {
      label: 'Password',
      placeholder: 'Enter your password',
    },
    keepLoggedIn: 'Keep me logged in',
    forgotIdOrPwd: 'forgot ID or password?',
    login: 'Log in',
    createAccount: {
      label: 'Don’t have an account yet?',
      link: 'Create account',
    },
  },
} as const
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
