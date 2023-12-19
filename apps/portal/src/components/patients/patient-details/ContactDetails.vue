<template>
  <div>
    <p class="font-weight-medium">Contact details</p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <div v-if="mdAndUp">
          <v-row dense justify="center" align="center">
            <v-col class="v-col-2" align="center">
              <div class="d-flex flex-column">
                <ImageUpload
                  :default-state="defaultState.avatar || ''"
                  @update="value => handleFieldUpdate('avatar', value)"
                />
              </div>
            </v-col>
            <v-divider vertical class="mx-5"></v-divider>
            <v-col>
              <div
                v-for="(config, fieldName) in formConfigNames"
                :key="fieldName"
              >
                <div v-if="config.type === 'input'">
                  <BaseInput
                    :type="config.inputType ?? 'text'"
                    :name="config.key"
                    :rules="config.rules ?? []"
                    :autocomplete="config.autocomplete ?? 'off'"
                    :value="formValues[fieldName]"
                    :suffix-icon="config.suffixIcon ?? ''"
                    :handle-icon-click="
                      config.handleSuffixIconClick ?? (() => {})
                    "
                    :class="config.class"
                    @update="config.handleUpdate"
                  >
                    <span class="input-label">
                      {{ config.label }}
                    </span>
                    <span v-if="config.labelSuffix" class="input-label suffix">
                      {{ config.labelSuffix }}
                    </span>
                  </BaseInput>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <div v-else>
          <v-row dense justify="center" align="center">
            <div class="d-flex flex-column">
              <ImageUpload
                :default-state="defaultState.avatar || ''"
                @update="value => handleFieldUpdate('avatar', value)"
              />
            </div>
          </v-row>
          <v-divider class="my-5" />
          <v-row dense justify="center" align="center">
            <v-col>
              <div
                v-for="(config, fieldName) in formConfigNames"
                :key="fieldName"
              >
                <div v-if="config.type === 'input'">
                  <BaseInput
                    :type="config.inputType ?? 'text'"
                    :name="config.key"
                    :rules="config.rules ?? []"
                    :autocomplete="config.autocomplete ?? 'off'"
                    :value="formValues[fieldName]"
                    :suffix-icon="config.suffixIcon ?? ''"
                    :handle-icon-click="
                      config.handleSuffixIconClick ?? (() => {})
                    "
                    :class="config.class"
                    @update="config.handleUpdate"
                  >
                    <span class="input-label">
                      {{ config.label }}
                    </span>
                    <span v-if="config.labelSuffix" class="input-label suffix">
                      {{ config.labelSuffix }}
                    </span>
                  </BaseInput>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col
            v-for="(fieldConfig, fieldName) in formConfigContact"
            :key="fieldName"
            cols="12"
            md="4"
          >
            <div v-if="fieldConfig.type === 'input'">
              <BaseInput
                :type="fieldConfig.inputType ?? 'text'"
                :name="fieldName"
                :value="formValues[fieldName]"
                :suffix-icon="fieldConfig.suffixIcon"
                :handle-icon-click="fieldConfig.handleSuffixIconClick"
                :rules="fieldConfig.rules"
                :readonly="fieldConfig.readonly || false"
                @update="newVal => handleFieldUpdate(fieldName, newVal)"
              >
                <span class="input-label">
                  {{ fieldConfig.label }}
                </span>
                <span v-if="fieldConfig.labelSuffix" class="input-label suffix">
                  {{ fieldConfig.labelSuffix }}
                </span>
              </BaseInput>
            </div>
          </v-col>
          <v-dialog v-model="changeEmailDialog" max-width="90vw">
            <v-card>
              <v-card-title>Change Email</v-card-title>
              <v-card-text>
                <BaseInput type="email" :value="currentEmailAddress" readonly>
                  <span class="input-label">
                    {{ t('profile.form.contactDetails.email.label') }}
                  </span>
                </BaseInput>
                <BaseInput
                  type="email"
                  :value="formValues.email"
                  @update="newVal => handleFieldUpdate('email', newVal)"
                >
                  <span class="input-label">
                    New {{ t('profile.form.contactDetails.email.label') }}
                  </span>
                </BaseInput>
                <v-btn
                  size="small"
                  type="submit"
                  color="secondary text-capitalize"
                  class="mb-10"
                  :disabled="showVerificationTokenField"
                  :loading="generateTokenMutation.isLoading.value"
                  @click="handleSendVerificationToken"
                >
                  {{
                    showVerificationTokenField
                      ? 'Verification token sent'
                      : 'Send verification token'
                  }}
                </v-btn>
                <v-text-field
                  v-if="showVerificationTokenField"
                  v-model="verificationToken"
                  label="Enter Verification Token"
                  required
                ></v-text-field>
                <v-alert
                  v-if="errorMsg"
                  type="error"
                  dense
                  border="top"
                  variant="outlined"
                >
                  {{ errorMsg }}
                </v-alert>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="!verificationToken"
                  color="primary"
                  @click="handleVerifyToken"
                >
                  Verify Token
                </v-btn>
                <v-btn color="grey" @click="() => (changeEmailDialog = false)">
                  Close
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'

import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import {
  useGenerateToken,
  useVerifyToken,
} from '@intake24-dietician/portal/mutations/useAuth'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import { Form } from '../../profile/types'
import ImageUpload from '../../profile/ImageUpload.vue'
import {
  PatientCreateDto,
  PatientCreateDtoSchema,
  UserCreateDto,
  UserCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/user.dto'

export type ContactDetailsFormValues = Pick<
  PatientCreateDto,
  | 'firstName'
  | 'middleName'
  | 'lastName'
  | 'avatar'
  | 'mobileNumber'
  | 'address'
> &
  Pick<UserCreateDto, 'email'>

const props = defineProps<{
  defaultState: ContactDetailsFormValues
  handleSubmit?: () => Promise<void>
  mode: 'Add' | 'Edit'
}>()
const emit = defineEmits<{
  update: [value: ContactDetailsFormValues]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

// Email change refs and composables
const generateTokenMutation = useGenerateToken()
const verifyTokenMutation = useVerifyToken()

const currentEmailAddress = ref('')
const changeEmailDialog = ref(false)
const verificationToken = ref('')
const showVerificationTokenField = ref(false)
const errorMsg = ref('')

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<ContactDetailsFormValues>({ ...props.defaultState })

const handleFieldUpdate = (
  fieldName: keyof ContactDetailsFormValues,
  newVal: string,
) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const handleSendVerificationToken = () => {
  generateTokenMutation.mutate(
    {
      currentEmail: currentEmailAddress.value,
      newEmail: formValues.value.email,
    },
    {
      onSuccess() {
        showVerificationTokenField.value = true
        errorMsg.value = ''
      },
      onError() {
        errorMsg.value =
          'Error sending verification token. Please try another email address.'
      },
    },
  )
}

const handleVerifyToken = () => {
  verifyTokenMutation.mutate(
    { token: verificationToken.value },
    {
      onSuccess: async () => {
        try {
          if (props.handleSubmit) await props.handleSubmit()

          changeEmailDialog.value = false
          errorMsg.value = ''
          currentEmailAddress.value = formValues.value.email
        } catch (error) {
          errorMsg.value = 'Error updating email address'
        }
      },
      onError() {
        errorMsg.value = 'Invalid verification token'
      },
    },
  )
}

const formConfigNames: Form<
  keyof Pick<PatientCreateDto, 'firstName' | 'middleName' | 'lastName'>
> = {
  firstName: {
    key: 'firstName',
    label: t('profile.form.personalDetails.firstName.label'),
    required: true,
    labelSuffix: t('profile.form.personalDetails.firstName.labelSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(PatientCreateDtoSchema.shape.firstName, value),
    ],
    handleUpdate: val => handleFieldUpdate('firstName', val),
  },
  middleName: {
    key: 'middleName',
    label: t('profile.form.personalDetails.middleName.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(PatientCreateDtoSchema.shape.middleName, value),
    ],
    handleUpdate: val => handleFieldUpdate('middleName', val),
  },
  lastName: {
    key: 'lastName',
    label: t('profile.form.personalDetails.lastName.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(PatientCreateDtoSchema.shape.lastName, value),
    ],
    handleUpdate: val => handleFieldUpdate('lastName', val),
  },
}

// eslint-disable-next-line vue/no-setup-props-destructure
type Field =
  | keyof Pick<PatientCreateDto, 'mobileNumber' | 'address'>
  | keyof Pick<UserCreateDto, 'email'>
const formConfigContact: Form<Field> =
  // eslint-disable-next-line vue/no-setup-props-destructure
  {
    mobileNumber: {
      key: 'mobileNumber',
      autocomplete: 'tel',
      label: t('profile.form.contactDetails.mobileNumber.label'),
      labelSuffix: t('profile.form.contactDetails.mobileNumber.labelSuffix'),
      required: true,
      type: 'input',
      inputType: 'text',
      rules: [
        (value: string) =>
          validateWithZod(PatientCreateDtoSchema.shape.mobileNumber, value),
      ],
      handleUpdate: val => handleFieldUpdate('mobileNumber', val),
    },
    email: {
      key: 'email',
      autocomplete: 'email',
      label: t('profile.form.contactDetails.email.label'),
      labelSuffix: t('profile.form.contactDetails.email.labelSuffix'),
      required: true,
      readonly: props.mode === 'Edit',
      type: 'input',
      inputType: 'text',
      rules: [
        (value: string) =>
          validateWithZod(UserCreateDtoSchema.shape.email, value),
      ],
      handleUpdate: val => handleFieldUpdate('email', val),
      suffixIcon: props.mode === 'Edit' ? 'mdi-mail' : '',
      handleSuffixIconClick: () => {
        changeEmailDialog.value = true
      },
    },
    address: {
      key: 'address',
      autocomplete: 'address-level3',
      label: 'Address',
      required: false,
      type: 'input',
      inputType: 'text',
      rules: [
        (value: string) =>
          validateWithZod(PatientCreateDtoSchema.shape.address, value),
      ],
      handleUpdate: val => handleFieldUpdate('address', val),
    },
  }

watch(
  () => props.defaultState,
  newDefaultState => {
    formValues.value = {
      ...formValues.value,
      firstName: newDefaultState.firstName,
      lastName: newDefaultState.lastName,
    }

    if (!currentEmailAddress.value) {
      currentEmailAddress.value = newDefaultState.email
    }
  },
  { immediate: true },
)
</script>
<style scoped lang="scss">
.avatar {
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
}

.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
