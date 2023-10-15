<template>
  <div>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col cols="12" md="4">
            <!-- Email address -->
            <BaseInput
              type="email"
              name="emailAddress"
              autocomplete="email"
              readonly
              :value="currentEmailAddress"
              :rules="[emailValidator]"
              suffix-icon="mdi-mail"
              :handle-icon-click="
                () => {
                  changeEmailDialog = true
                }
              "
              class="base-input"
              @update="newVal => handleFieldUpdate('emailAddress', newVal)"
            >
              <span class="input-label">
                {{ t('profile.form.contactDetails.email.label') }}
              </span>
              <span class="input-label suffix">
                {{ t('profile.form.contactDetails.email.labelSuffix') }}
              </span>
            </BaseInput>
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
                    @update="
                      newVal => handleFieldUpdate('emailAddress', newVal)
                    "
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
                  <v-btn
                    color="grey"
                    @click="() => (changeEmailDialog = false)"
                  >
                    Close
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <!-- Mobile number -->
            <BaseInput
              type="tel"
              name="mobileNumber"
              autocomplete="tel"
              suffix-icon="mdi-restore"
              :handle-icon-click="
                () => {
                  formValues.mobileNumber = user.dieticianProfile.mobileNumber
                  emit('update', { ...formValues })
                }
              "
              :value="formValues.mobileNumber"
              :rules="[mobileNumberValidator]"
              @update="newVal => handleFieldUpdate('mobileNumber', newVal)"
            >
              <span class="input-label">
                {{ t('profile.form.contactDetails.mobileNumber.label') }}
              </span>
              <span class="input-label suffix">
                {{ t('profile.form.contactDetails.mobileNumber.labelSuffix') }}
              </span>
            </BaseInput>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <!-- Business number -->
            <BaseInput
              type="text"
              name="businessNumber"
              autocomplete="tel"
              suffix-icon="mdi-restore"
              :handle-icon-click="
                () => {
                  formValues.businessNumber =
                    user.dieticianProfile.businessNumber ?? ''
                  emit('update', { ...formValues })
                }
              "
              :value="formValues.businessNumber"
              @update="newVal => handleFieldUpdate('businessNumber', newVal)"
            >
              <span class="input-label">
                {{ t('profile.form.contactDetails.businessNumber.label') }}
              </span>
            </BaseInput>
          </v-col>
        </v-row>
        <v-divider class="my-3"></v-divider>
        <v-row>
          <v-col cols="12">
            <!-- Business address -->
            <BaseInput
              type="text"
              name="businessAddress"
              autocomplete="address-level3"
              suffix-icon="mdi-restore"
              :handle-icon-click="
                () => {
                  formValues.businessAddress =
                    user.dieticianProfile.businessAddress ?? ''
                  emit('update', { ...formValues })
                }
              "
              :value="formValues.businessAddress"
              @update="newVal => handleFieldUpdate('businessAddress', newVal)"
            >
              <span class="input-label">
                {{ t('profile.form.contactDetails.businessAddress.label') }}
              </span>
            </BaseInput>
          </v-col>
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
import { useDebounceFn } from '@vueuse/core'
import { INPUT_DEBOUNCE_TIME } from '@/constants'
import { emailValidator } from '@/validators/auth'
import { mobileNumberValidator } from '@/validators/auth/profile'
import {
  DieticianProfileValues,
  UserAttributesWithDieticianProfile,
} from '@intake24-dietician/common/types/auth'
import { useGenerateToken, useVerifyToken } from '@/mutations/useAuth'

export interface ContactDetailsFormValues {
  emailAddress: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
}

const props = defineProps<{
  user: UserAttributesWithDieticianProfile
  profileFormValues: DieticianProfileValues
  handleSubmit: () => Promise<void>
}>()
const emit = defineEmits<{
  update: [value: ContactDetailsFormValues]
}>()

const generateTokenMutation = useGenerateToken()
const verifyTokenMutation = useVerifyToken()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const currentEmailAddress = ref('')
const formValues = ref<ContactDetailsFormValues>({
  emailAddress: '',
  mobileNumber: '',
  businessNumber: '',
  businessAddress: '',
})

onMounted(() => {
  currentEmailAddress.value = props.user.email
  formValues.value = {
    emailAddress: props.user.email,
    mobileNumber: props.user.dieticianProfile.mobileNumber,
    businessNumber: props.user.dieticianProfile.businessNumber,
    businessAddress: props.user.dieticianProfile.businessAddress,
  }
})

const changeEmailDialog = ref(false)
const verificationToken = ref('')
const showVerificationTokenField = ref(false)
const errorMsg = ref('')

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof ContactDetailsFormValues, newVal: string) => {
    formValues.value[fieldName] = newVal
    emit('update', { ...formValues.value })
  },
  INPUT_DEBOUNCE_TIME,
)

const handleSendVerificationToken = () => {
  // TODO: Call API to send verification code
  console.log({
    currentEmail: currentEmailAddress.value,
    newEmail: formValues.value.emailAddress,
  })
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
          await props.handleSubmit()
          changeEmailDialog.value = false
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
</script>
<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
