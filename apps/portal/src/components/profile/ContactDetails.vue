<template>
  <div>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col
            v-for="(fieldConfig, fieldName) in formConfig"
            :key="fieldName"
            :cols="fieldConfig.layout?.cols"
            :sm="fieldConfig.layout?.sm"
            :md="fieldConfig.layout?.md"
            :lg="fieldConfig.layout?.lg"
            :xl="fieldConfig.layout?.xl"
          >
            <v-divider
              v-if="fieldConfig.layout && shouldShowDivider(fieldConfig.layout)"
              class="mb-5"
            />
            <BaseInput
              :type="fieldConfig.inputType"
              :name="fieldName"
              :value="formValues[fieldName]"
              :suffix-icon="fieldConfig.suffixIcon"
              :handle-icon-click="fieldConfig.handleSuffixIconClick"
              :rules="fieldConfig.rules"
              :readonly="fieldConfig.readonly"
              @update="newVal => handleFieldUpdate(fieldName, newVal)"
            >
              <span class="input-label">
                {{ fieldConfig.label }}
              </span>
              <span v-if="fieldConfig.labelSuffix" class="input-label suffix">
                {{ fieldConfig.labelSuffix }}
              </span>
            </BaseInput>
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
                  :value="formValues.emailAddress"
                  @update="newVal => handleFieldUpdate('emailAddress', newVal)"
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
import { onMounted, ref } from 'vue'
import BaseInput from '@/components/form/BaseInput.vue'
import { useDisplay } from 'vuetify'
import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { useGenerateToken, useVerifyToken } from '@/mutations/useAuth'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import { Form, Layout } from './types'
import { contactDetailsSchema } from '@intake24-dietician/portal/schema/profile'

export interface ContactDetailsFormValues {
  emailAddress: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
}

const props = defineProps<{
  defaultState: ContactDetailsFormValues
  email: string
  handleSubmit: (validate: boolean) => Promise<void>
}>()
const emit = defineEmits<{
  update: [value: ContactDetailsFormValues]
}>()

const generateTokenMutation = useGenerateToken()
const verifyTokenMutation = useVerifyToken()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const currentEmailAddress = ref('')
// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<ContactDetailsFormValues>(props.defaultState)

const shouldShowDivider = (layout: Layout) => {
  return (
    layout.cols === 12 && !layout.sm && !layout.md && !layout.lg && !layout.xl
  )
}

onMounted(() => {
  currentEmailAddress.value = props.email
  formValues.value = props.defaultState
})

const changeEmailDialog = ref(false)
const verificationToken = ref('')
const showVerificationTokenField = ref(false)
const errorMsg = ref('')

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
      newEmail: formValues.value.emailAddress,
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
          await props.handleSubmit(false)
          changeEmailDialog.value = false
          showVerificationTokenField.value = false
          verificationToken.value = ''
          errorMsg.value = ''
          currentEmailAddress.value = formValues.value.emailAddress
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

const fields = contactDetailsSchema.fields
type Field = (typeof fields)[number]

const formConfig: Form<Field> = {
  emailAddress: {
    key: 'emailAddress',
    autocomplete: 'email',
    label: t('profile.form.contactDetails.email.label'),
    labelSuffix: t('profile.form.contactDetails.email.labelSuffix'),
    required: true,
    readonly: true,
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(contactDetailsSchema.schema.emailAddress, value),
    ],
    handleUpdate: val => handleFieldUpdate('emailAddress', val),
    layout: { cols: 12, md: 4 },
    suffixIcon: 'mdi-mail',
    handleSuffixIconClick: () => {
      changeEmailDialog.value = true
    },
  },
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
        validateWithZod(contactDetailsSchema.schema.mobileNumber, value),
    ],
    handleUpdate: val => handleFieldUpdate('mobileNumber', val),
    layout: { cols: 12, md: 4 },
  },
  businessNumber: {
    key: 'businessNumber',
    label: t('profile.form.contactDetails.businessNumber.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(contactDetailsSchema.schema.businessNumber, value),
    ],
    handleUpdate: val => handleFieldUpdate('businessNumber', val),
    layout: { cols: 12, md: 4 },
  },
  businessAddress: {
    key: 'businessAddress',
    autocomplete: 'address-level3',
    label: t('profile.form.contactDetails.businessAddress.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(contactDetailsSchema.schema.businessAddress, value),
    ],
    handleUpdate: val => handleFieldUpdate('businessAddress', val),
    layout: { cols: 12 },
  },
}
</script>
<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
