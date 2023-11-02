<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.personalDetails.title') }}
    </p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
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
                  {{ t('profile.form.personalDetails.uploadImage') }}
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
                suffix-icon="mdi-restore"
                class="base-input"
                :handle-icon-click="
                  () => {
                    formValues.firstName = props.defaultState.firstName
                    emit('update', { ...formValues })
                  }
                "
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
                suffix-icon="mdi-restore"
                :handle-icon-click="
                  () => {
                    formValues.middleName = props.defaultState.middleName
                    emit('update', { ...formValues })
                  }
                "
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
                suffix-icon="mdi-restore"
                :handle-icon-click="
                  () => {
                    formValues.lastName = props.defaultState.lastName
                    emit('update', { ...formValues })
                  }
                "
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
                {{ t('profile.form.personalDetails.uploadImage') }}
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
                suffix-icon="mdi-restore"
                class="base-input"
                :handle-icon-click="
                  () => {
                    formValues.firstName = props.defaultState.firstName
                    emit('update', { ...formValues })
                  }
                "
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
                suffix-icon="mdi-restore"
                :handle-icon-click="
                  () => {
                    formValues.middleName = props.defaultState.middleName
                    emit('update', { ...formValues })
                  }
                "
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
                suffix-icon="mdi-restore"
                :handle-icon-click="
                  () => {
                    formValues.lastName = props.defaultState.lastName
                    emit('update', { ...formValues })
                  }
                "
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
import { onMounted, ref } from 'vue'
import { getDefaultAvatar } from '@/utils/profile'

export interface PersonalDetailsFormValues {
  firstName: string
  middleName: string
  lastName: string
  avatar: string
}

const props = defineProps<{
  defaultState: PersonalDetailsFormValues
  email: string
}>()
const emit = defineEmits<{
  update: [value: PersonalDetailsFormValues]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const imageUpload = ref()
const avatarImage = ref('')

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<PersonalDetailsFormValues>(props.defaultState)

onMounted(() => {
  const imageSrc = props.defaultState.avatar
  avatarImage.value = imageSrc || getDefaultAvatar(props.email)
})

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof PersonalDetailsFormValues, newVal: string) => {
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
