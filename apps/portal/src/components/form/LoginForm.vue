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
      <div v-show="loginMutation.isError" class="pt-10">
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
          @submit.prevent="onSubmit"
        >
          <VBaseInput
            v-for="input in formConfig"
            :key="input.key"
            :type="input.inputType"
            :placeholder="input.placeholder"
            :autocomplete="input.autocomplete"
            :name="input.key"
            :rules="input.rules"
            :data-cy="input.dataCy"
            :suffix-icon="input.suffixIcon"
            :handle-icon-click="input.handleSuffixIconClick"
          >
            {{ input.label }}
          </VBaseInput>
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
            id="login-form-submit"
            class="text-subtitle-1 w-75 mt-6 mx-auto mx-md-0 text-white"
            color="#EE672D"
            size="large"
            :disabled="!meta.valid"
            variant="flat"
            type="submit"
            :loading="loginMutation.isPending.value"
          >
            {{ t('login.form.login') }}
          </v-btn>
        </v-form>
      </div>
    </div>
    <div v-if="loginMutation.data.value === undefined" class="px-16">
      {{ t('login.form.createAccount.label') }}
      <router-link
        to="register"
        class="text-decoration-none text-primary font-weight-bold"
      >
        {{ t('login.form.createAccount.link') }}
      </router-link>
    </div>
    <div v-else class="pl-16">
      <BaseProgressCircular />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useLogin } from '@/mutations/useAuth'
import type { Form } from '@/types/form.types'
import { LoginDtoSchema } from '@intake24-dietician/common/entities-new/auth.dto'
import type { i18nOptions } from '@intake24-dietician/i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import BaseProgressCircular from '../common/BaseProgressCircular.vue'
import VBaseInput from './VBaseInput.vue'
import { useClinicStore } from '@intake24-dietician/portal/stores/clinic'

const router = useRouter()

// i18n
const { t } = useI18n<i18nOptions>()

// Mutations
const loginMutation = useLogin()

// Refs
const form = ref(null)
const error = ref('')
const errorAlert = ref(false)

// Form fields
const { handleSubmit, meta } = useForm({
  validationSchema: toTypedSchema(LoginDtoSchema),
})
const passwordVisible = ref(false)

const formConfig: Ref<Form<['email', 'password'][number]>> = ref({
  email: {
    type: 'input',
    inputType: 'text',
    placeholder: t('login.form.email.placeholder'),
    label: t('login.form.email.label'),
    autocomplete: 'username',
    key: 'email',
    dataCy: 'email',
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
    dataCy: 'password',
  },
})

// Functions
const onSubmit = handleSubmit(values => {
  loginMutation.mutate(values, {
    onSuccess: async () => {
      const clinicStore = useClinicStore()
      await clinicStore.refetchClinics()

      if (clinicStore.clinics.length < 1) {
        router.push({ name: 'Add Survey' })
      } else {
        clinicStore.switchToFirstClinic()
        clinicStore.navigateToSurveyPatientList()
      }
    },
    onError: () => {
      error.value = 'Invalid credentials. Please try again'
      errorAlert.value = true
    },
  })
})
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
