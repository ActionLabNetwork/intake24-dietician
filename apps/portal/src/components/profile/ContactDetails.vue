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
                  :value="formValues.email"
                  @update="newVal => handleFieldUpdate('email', newVal)"
                >
                  <span class="input-label">
                    New {{ t('profile.form.contactDetails.email.label') }}
                  </span>
                </BaseInput>
              </v-card-text>
              <v-card-actions>
                <v-btn
                  :disabled="currentEmailAddress === formValues.email"
                  color="primary"
                  :loading="requestEmailChangeMutation.isPending.value"
                  @click="requestEmailChange"
                >
                  Request Email Change
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
import { useRequestEmailChange } from '@/mutations/useAuth'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import { Form, Layout } from './types'
import {
  DieticianUpdateDto,
  UserCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/user.dto'
import { useToast } from 'vue-toast-notification'

export interface ContactDetailsFormValues {
  email: string
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

// const generateTokenMutation = useGenerateToken()
// const verifyTokenMutation = useVerifyToken()
const requestEmailChangeMutation = useRequestEmailChange()
const $toast = useToast()

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

const handleFieldUpdate = (
  fieldName: keyof ContactDetailsFormValues,
  newVal: string,
) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const requestEmailChange = async () => {
  try {
    requestEmailChangeMutation.mutate({
      newEmail: formValues.value.email,
    })
    $toast.info('Please check your email inbox to verify the email change.')
  } catch (e) {
    $toast.info('Failed to request to change the email.')
  } finally {
    changeEmailDialog.value = false
  }
}

const formConfig: Form<keyof ContactDetailsFormValues> = {
  email: {
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
        validateWithZod(UserCreateDtoSchema.shape.email, value),
    ],
    handleUpdate: val => handleFieldUpdate('email', val),
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
        validateWithZod(DieticianUpdateDto.shape.mobileNumber, value),
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
        validateWithZod(DieticianUpdateDto.shape.businessNumber, value),
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
        validateWithZod(DieticianUpdateDto.shape.businessAddress, value),
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
