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
          <BaseInput
            v-for="(input, field) in formConfig"
            :key="input.key"
            :value="formValues[field]"
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
            :disabled="
              !loginForm.isFormValid(formValues) ||
              loginMutation.isLoading.value
            "
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
      <BaseProgressCircular />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, computed, reactive, ref } from 'vue'

import BaseInput from '@/components/form/BaseInput.vue'

import { useLogin } from '@/mutations/useAuth'

import { useI18n } from 'vue-i18n'
import type { i18nOptions } from '@intake24-dietician/i18n'

import router from '@/router'
import { useForm } from '@intake24-dietician/portal/composables/useForm'
import { LoginSchema } from '@intake24-dietician/portal/schema/auth'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import type { Form } from '@/types/form.types'
import BaseProgressCircular from '../common/BaseProgressCircular.vue'

// Stores

// i18n
const { t } = useI18n<i18nOptions>()

// Mutations
const loginMutation = useLogin()

// Refs
const form = ref(null)
const error = ref('')
const errorAlert = ref(false)

// Form fields
const formValues = reactive({ email: '', password: '' })
const passwordVisible = ref(false)

const loginForm = useForm<typeof formValues, typeof formValues>({
  initialValues: formValues,
  schema: LoginSchema.zodSchema,
  mutationFn: loginMutation.mutateAsync,
  onSuccess: () => {
    router.push('/dashboard/my-profile')
  },
  onError: () => {
    error.value = 'Invalid credentials. Please try again'
    errorAlert.value = true
  },
})

const formConfig: Ref<Form<(typeof LoginSchema.fields)[number]>> = ref({
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
    rules: [(v: string) => validateWithZod(LoginSchema.schema.password, v)],
  },
})

// Functions
const handleSubmit = () => {
  loginForm.handleSubmit(formValues, formValues)
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
