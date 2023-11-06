<template>
  <div>
    <p class="font-weight-medium">Contact details</p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <div v-if="mdAndUp">
          <v-row dense justify="center" align="center">
            <v-col class="v-col-2" align="center">
              <div class="d-flex flex-column">
                <v-avatar size="100%" class="avatar mx-auto">
                  <v-img
                    :src="avatarImage"
                    alt="Avatar"
                    height="100%"
                    width="100%"
                  />
                </v-avatar>
                <v-btn
                  class="mt-5 text-center font-weight-medium text-capitalize"
                  flat
                  @click="
                    () => {
                      imageUpload.click()
                    }
                  "
                >
                  {{ mode === 'Add' ? 'Upload Image' : 'Update Image' }}
                </v-btn>
                <input
                  ref="imageUpload"
                  type="file"
                  accept="image/*"
                  hidden
                  @change="handleImageUpload"
                />
              </div>
            </v-col>
            <v-divider vertical class="mx-5"></v-divider>
            <v-col>
              <!-- First name -->
              <BaseInput
                type="text"
                name="firstName"
                autocomplete="given-name"
                :value="formValues.firstName"
                :rules="[requiredValidator('First name')]"
                @update="val => handleFieldUpdate('firstName', val)"
              >
                <span class="input-label">
                  {{ t('profile.form.personalDetails.firstName.label') }}
                </span>
                <span class="input-label suffix">
                  {{ t('profile.form.personalDetails.firstName.labelSuffix') }}
                </span>
              </BaseInput>
              <!-- Middle name -->
              <BaseInput
                type="text"
                name="middleName"
                autocomplete="additional-name"
                :value="formValues.middleName"
                @update="val => handleFieldUpdate('middleName', val)"
              >
                <p class="input-label">
                  {{ t('profile.form.personalDetails.middleName.label') }}
                </p>
              </BaseInput>
              <!-- Last name -->
              <BaseInput
                type="text"
                name="lastName"
                autocomplete="family-name"
                :value="formValues.lastName"
                @update="val => handleFieldUpdate('lastName', val)"
              >
                <p class="input-label">
                  {{ t('profile.form.personalDetails.lastName.label') }}
                </p>
              </BaseInput>
            </v-col>
          </v-row>
        </div>

        <div v-else>
          <v-row dense justify="center" align="center">
            <div class="d-flex flex-column">
              <v-avatar size="100%" class="avatar mx-auto">
                <v-img
                  :src="avatarImage"
                  alt="Avatar"
                  height="100%"
                  width="100%"
                />
              </v-avatar>
              <v-btn
                class="mt-5 text-center font-weight-medium text-capitalize"
                flat
                @click="
                  () => {
                    imageUpload.click()
                  }
                "
              >
                {{ mode === 'Add' ? 'Upload Image' : 'Update Image' }}
              </v-btn>
              <input
                ref="imageUpload"
                type="file"
                accept="image/*"
                hidden
                @change="handleImageUpload"
              />
            </div>
          </v-row>
          <v-divider class="my-5" />
          <v-row dense justify="center" align="center">
            <v-col>
              <!-- First name -->
              <BaseInput
                type="text"
                name="firstName"
                autocomplete="given-name"
                :value="formValues.firstName"
                :rules="[requiredValidator('First name')]"
                @update="val => handleFieldUpdate('firstName', val)"
              >
                <span class="input-label">
                  {{ t('profile.form.personalDetails.firstName.label') }}
                </span>
                <span class="input-label suffix">
                  {{ t('profile.form.personalDetails.firstName.labelSuffix') }}
                </span>
              </BaseInput>
              <!-- Middle name -->
              <BaseInput
                type="text"
                name="middleName"
                autocomplete="additional-name"
                :value="formValues.middleName"
                @update="val => handleFieldUpdate('middleName', val)"
              >
                <p class="input-label">
                  {{ t('profile.form.personalDetails.middleName.label') }}
                </p>
              </BaseInput>
              <!-- Last name -->
              <BaseInput
                type="text"
                name="lastName"
                autocomplete="family-name"
                :value="formValues.lastName"
                @update="val => handleFieldUpdate('lastName', val)"
              >
                <p class="input-label">
                  {{ t('profile.form.personalDetails.lastName.label') }}
                </p>
              </BaseInput>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-card>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col cols="12" md="4">
            <!-- Mobile number -->
            <BaseInput
              type="tel"
              name="mobileNumber"
              autocomplete="tel"
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
          <v-col cols="12" md="4">
            <div v-if="mode === 'Add'">
              <!-- Email address -->
              <BaseInput
                type="email"
                name="emailAddress"
                autocomplete="email"
                :value="formValues.emailAddress"
                :rules="[emailValidator]"
                @update="newVal => handleFieldUpdate('emailAddress', newVal)"
              >
                <span class="input-label">
                  {{ t('profile.form.contactDetails.email.label') }}
                </span>
                <span class="input-label suffix">
                  {{ t('profile.form.contactDetails.email.labelSuffix') }}
                </span>
              </BaseInput>
            </div>
            <div v-if="mode === 'Edit'">
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
                    <BaseInput
                      type="email"
                      :value="currentEmailAddress"
                      readonly
                    >
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
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <!-- Address -->
            <BaseInput
              type="text"
              name="address"
              autocomplete="address-level3"
              :value="formValues.address"
              @update="newVal => handleFieldUpdate('address', newVal)"
            >
              <span class="input-label"> Address </span>
            </BaseInput>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'
import { useDebounceFn } from '@vueuse/core'

import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { INPUT_DEBOUNCE_TIME } from '@/constants'
import { requiredValidator, emailValidator } from '@/validators/auth'
import { mobileNumberValidator } from '@intake24-dietician/portal/validators/auth/profile'
import { ref, watch } from 'vue'
import { getDefaultAvatar } from '@intake24-dietician/portal/utils/profile'
import {
  useGenerateToken,
  useVerifyToken,
} from '@intake24-dietician/portal/mutations/useAuth'

export interface ContactDetailsFormValues {
  firstName: string
  middleName: string
  lastName: string
  avatar: string
  mobileNumber: string
  emailAddress: string
  address: string
}

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

const imageUpload = ref()
const avatarImage = ref()

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

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof ContactDetailsFormValues, newVal: string) => {
    formValues.value[fieldName] = newVal
    emit('update', { ...formValues.value })
  },
  INPUT_DEBOUNCE_TIME,
)

const handleImageUpload = () => {
  const file = imageUpload.value.files[0]

  if (!file) return

  const objectURL = URL.createObjectURL(file)
  avatarImage.value = objectURL

  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onloadend = () => {
    const base64data = reader.result
    formValues.value.avatar = base64data?.toString() ?? ''
    emit('update', { ...formValues.value })

    URL.revokeObjectURL(objectURL)
  }
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
          if (props.handleSubmit) await props.handleSubmit()

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

watch(
  () => props.defaultState,
  newDefaultState => {
    formValues.value = {
      ...formValues.value,
      firstName: newDefaultState.firstName,
      lastName: newDefaultState.lastName,
    }
    avatarImage.value =
      newDefaultState.avatar ?? getDefaultAvatar(newDefaultState.emailAddress)

    if (!currentEmailAddress.value) {
      currentEmailAddress.value = newDefaultState.emailAddress
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
