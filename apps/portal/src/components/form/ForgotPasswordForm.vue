<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div
      v-if="loginMutation.data.value === undefined"
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
          <v-btn
            class="text-subtitle-1 w-75 mt-6"
            color="#EE672D"
            size="large"
            variant="flat"
            type="submit"
            :disabled="!form || loginMutation.isLoading.value"
            :loading="loginMutation.isLoading.value"
          >
            {{ messages.form.resetPassword }}
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
import BaseInput from '@/components/form/BaseInput.vue'

import { emailValidator } from '@/validators/auth'
import { useLogin } from '@/mutations/useAuth'

// TODO: Migrate this to i18n
const messages = {
  title: 'Welcome back',
  subtitle: 'Reset your email address',
  form: {
    email: {
      label: 'Enter your registered email address',
      placeholder: 'Enter your email address',
    },
    resetPassword: 'Reset password',
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
