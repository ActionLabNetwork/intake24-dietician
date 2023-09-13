<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div
      v-if="loginMutation.data.value === undefined"
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
          title="Login failed"
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
          >
            {{ messages.form.email.label }}
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
            type="submit"
            :disabled="!form || loginMutation.isLoading.value"
            :loading="loginMutation.isLoading.value"
          >
            {{ messages.form.login }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="loginMutation.data.value === undefined">
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
    <div v-else class="pl-16">
      <h1>Welcome</h1>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import BaseInput from './form/BaseInput.vue'

import { emailValidator, passwordValidator } from '../validators/auth'
import { useLogin } from '../mutations/useAuth'

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

const loginMutation = useLogin()

const form = ref(null)
const error = ref('')
const errorAlert = ref(false)

// Form fields
const email = ref('')
const password = ref('')
const passwordVisible = ref(false)

const handleSubmit = () => {
  const isFormValid = form.value
  if (isFormValid) {
    loginMutation.mutate(
      {
        email: email.value,
        password: password.value,
      },
      {
        onSuccess(data) {
          console.log({ data })
        },
        onError() {
          error.value = 'Invalid credentials. Please try again'
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
