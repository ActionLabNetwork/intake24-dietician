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
        <h1>{{ t('login.title') }}</h1>
        <h2>{{ t('login.subtitle') }}</h2>
      </div>
      <div v-show="errorAlert" class="pt-10">
        <v-alert
          v-model="errorAlert"
          closable
          type="error"
          :title="t('login.errors.loginFailed')"
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
            :placeholder="t('login.form.email.placeholder')"
            autocomplete="username"
            name="email"
            :rules="[emailValidator]"
            :value="email"
            @update="newVal => (email = newVal)"
          >
            {{ t('login.form.email.label') }}
          </BaseInput>
          <!-- Password -->
          <BaseInput
            :type="passwordVisible ? 'text' : 'password'"
            :placeholder="t('login.form.password.placeholder')"
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
            {{ t('login.form.password.label') }}
          </BaseInput>
          <div
            class="d-flex flex-column flex-lg-row align-center justify-space-between"
          >
            <div>
              <v-switch
                class="d-flex justify-center"
                :label="t('login.form.keepLoggedIn')"
                color="success"
              />
            </div>
            <div>
              <router-link to="/auth/forgot-password">
                {{ t('login.form.forgotIdOrPwd') }}
              </router-link>
            </div>
          </div>
          <v-btn
            class="text-subtitle-1 w-75 mt-6 mx-auto mx-md-0"
            color="#EE672D"
            size="large"
            variant="flat"
            type="submit"
            :disabled="!form || loginMutation.isLoading.value"
            :loading="loginMutation.isLoading.value"
          >
            {{ t('login.form.login') }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="loginMutation.data.value === undefined">
      <div class="text-center">
        {{ t('login.form.createAccount.label') }}
        <router-link
          to="register"
          class="text-decoration-none text-primary font-weight-bold"
        >
          {{ t('login.form.createAccount.link') }}
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

import { emailValidator, passwordValidator } from '@/validators/auth'
import { useLogin } from '@/mutations/useAuth'

import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'

const { t, locale } = useI18n<i18nOptions>()
locale.value = 'en'

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
