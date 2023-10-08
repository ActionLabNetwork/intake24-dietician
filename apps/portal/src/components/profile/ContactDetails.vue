<template>
  <div>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col>
            <!-- Email address -->
            <BaseInput
              type="email"
              name="emailAddress"
              autocomplete="email"
              :value="formValues.emailAddress"
              :rules="[emailValidator]"
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
          </v-col>
          <v-col>
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
          <v-col>
            <!-- Business number -->
            <BaseInput
              type="text"
              name="businessNumber"
              autocomplete="tel"
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
          <v-col>
            <!-- Business address -->
            <BaseInput
              type="text"
              name="businessAddress"
              autocomplete="address-level3"
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
import { ref } from 'vue'
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

export interface ContactDetailsFormValues {
  emailAddress: string
  mobileNumber: string
  businessNumber: string
  businessAddress: string
}

const props = defineProps<{
  user: UserAttributesWithDieticianProfile
  profileFormValues: DieticianProfileValues
}>()
const emit = defineEmits<{
  update: [value: ContactDetailsFormValues]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<ContactDetailsFormValues>({
  emailAddress: props.user.email,
  mobileNumber: props.user.dieticianProfile.mobileNumber,
  businessNumber: props.user.dieticianProfile.businessNumber ?? '',
  businessAddress: props.user.dieticianProfile.businessAddress ?? '',
})

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof ContactDetailsFormValues, newVal: string) => {
    formValues.value[fieldName] = newVal
    emit('update', { ...formValues.value })
  },
  INPUT_DEBOUNCE_TIME,
)
</script>
<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
