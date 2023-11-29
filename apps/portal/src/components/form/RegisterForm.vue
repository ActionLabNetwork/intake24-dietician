<template>
  <div class="d-flex flex-column justify-space-around h-screen">
    <div
      v-if="registerMutation.data.value === undefined"
      class="wrapper py-15 px-16 d-flex flex-column"
    >
      <div class="pb-16">
        <v-img max-width="10rem" src="@/assets/logo.svg" />
      </div>
      <div>
        <h1>{{ t('register.title') }}</h1>
        <h2>{{ t('register.subtitle') }}</h2>
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
        <v-form
          v-model="form"
          class="d-flex flex-column justify-center"
          @submit.prevent="handleSubmit"
        >
          <BaseInput
            v-for="(input, field) in formConfig"
            :key="input.key"
            v-model="formValues[field]"
            :type="input.inputType"
            :placeholder="input.placeholder"
            :autocomplete="input.autocomplete"
            :name="input.key"
            :rules="input.rules"
            :suffix-icon="input.suffixIcon"
            :handle-icon-click="input.handleSuffixIconClick"
            @update="newVal => (formValues[field] = newVal)"
          >
            {{ input.label }}
          </BaseInput>
          <!-- Create account button -->
          <v-btn
            class="text-subtitle-1 w-75 mt-6 mx-auto mx-md-0"
            color="#EE672D"
            size="large"
            variant="flat"
            type="submit"
            :disabled="!form || registerMutation.isLoading.value"
            :loading="registerMutation.isLoading.value"
          >
            {{ t('register.form.createAccount') }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="registerMutation.data.value === undefined">
      <div class="text-center">
        {{ t('register.form.login.label') }}
        <router-link
          to="login"
          class="text-decoration-none text-primary font-weight-bold"
        >
          {{ t('register.form.login.link') }}
        </router-link>
      </div>
    </div>
    <div v-if="registerMutation.data.value !== undefined">
      <h1 class="px-16">Welcome</h1>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, reactive, ref } from 'vue'

import BaseInput from '@/components/form/BaseInput.vue'

import { useRegister } from '@/mutations/useAuth'
import { confirmPasswordValidator } from '@/validators/auth'

import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'
import router from '@intake24-dietician/portal/router'
import { useForm } from '@intake24-dietician/portal/composables/useForm'
import {
  LoginSchema,
  RegisterSchema,
} from '@intake24-dietician/portal/schema/auth'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import type { Form } from '@/types/form.types'

const { t } = useI18n<i18nOptions>()

const registerMutation = useRegister()

const form = ref(null)
const error = ref('')
const errorAlert = ref(false)

// Form fields
const formValues = reactive({ email: '', password: '', confirmPassword: '' })

const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)

const registerForm = useForm<
  typeof formValues,
  Omit<typeof formValues, 'confirmPassword'>
>({
  initialValues: formValues,
  schema: RegisterSchema.zodSchema,
  mutationFn: registerMutation.mutateAsync,
  onSuccess: () => {
    router.push('/dashboard/my-profile')
  },
  onError: () => {
    error.value = 'Invalid credentials. Please try again with a different one'
    errorAlert.value = true
  },
})

const formConfig: Ref<Form<(typeof RegisterSchema.fields)[number]>> = ref({
  email: {
    type: 'input',
    inputType: 'text',
    placeholder: t('login.form.email.placeholder'),
    label: t('login.form.email.label'),
    autocomplete: 'username',
    key: 'email',
    rules: [(v: string) => validateWithZod(LoginSchema.schema.email, v)],
  },
  password: {
    type: 'input',
    inputType: computed(() => (passwordVisible.value ? 'text' : 'password')),
    placeholder: t('login.form.password.placeholder'),
    label: t('login.form.password.label'),
    autocomplete: 'new-password',
    key: 'password',
    suffixIcon: computed(() =>
      passwordVisible.value ? 'mdi-eye-outline' : 'mdi-eye-off-outline',
    ),
    handleSuffixIconClick: () => {
      passwordVisible.value = !passwordVisible.value
    },
    rules: [(v: string) => validateWithZod(RegisterSchema.schema.password, v)],
  },
  confirmPassword: {
    type: 'input',
    inputType: computed(() =>
      confirmPasswordVisible.value ? 'text' : 'password',
    ),
    placeholder: t('register.form.confirmPassword.placeholder'),
    label: t('register.form.confirmPassword.label'),
    autocomplete: 'new-password',
    key: 'confirmPassword',
    suffixIcon: computed(() =>
      confirmPasswordVisible.value ? 'mdi-eye-outline' : 'mdi-eye-off-outline',
    ),
    handleSuffixIconClick: () => {
      confirmPasswordVisible.value = !confirmPasswordVisible.value
    },
    rules: [
      (confirmPwd: string) =>
        confirmPasswordValidator(formValues.password, confirmPwd),
    ],
  },
})

const handleSubmit = () => {
  registerForm.handleSubmit(
    {
      email: formValues.email,
      password: formValues.password,
    },
    { email: formValues.email, password: formValues.password },
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
../validators/auth
