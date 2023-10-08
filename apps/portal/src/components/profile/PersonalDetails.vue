<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.personalDetails.title') }}
    </p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-col class="v-col-2" align="center">
            <v-avatar
              image="@/assets/dashboard/avatar.svg"
              size="x-large"
              class="avatar mx-auto"
            />
            <p class="mt-5 text-center font-weight-medium">
              {{ t('profile.form.personalDetails.uploadImage') }}
            </p>
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
              class="base-input"
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
import { requiredValidator } from '@/validators/auth'
import {
  DieticianProfileValues,
  UserAttributesWithDieticianProfile,
} from '@intake24-dietician/common/types/auth'
import { ref } from 'vue'

export interface PersonalDetailsFormValues {
  firstName: string
  middleName: string
  lastName: string
}

const props = defineProps<{
  user: UserAttributesWithDieticianProfile
  profileFormValues: DieticianProfileValues
}>()
const emit = defineEmits<{
  update: [value: PersonalDetailsFormValues]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<PersonalDetailsFormValues>({
  firstName: props.user.dieticianProfile.firstName,
  middleName: props.user.dieticianProfile.middleName ?? '',
  lastName: props.user.dieticianProfile.lastName ?? '',
})

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof PersonalDetailsFormValues, newVal: string) => {
    formValues.value[fieldName] = newVal
    emit('update', { ...formValues.value })
  },
  INPUT_DEBOUNCE_TIME,
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
