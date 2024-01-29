<template>
  <div>
    <p class="font-weight-medium">Contact details</p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <!-- Medium viewport and up -->
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
        <!-- Mobile version -->
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
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'

import { useDisplay } from 'vuetify'

import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import type { Form } from '../../profile/types'
import ImageUpload from '../../profile/ImageUpload.vue'
import type {
  PatientUpdateDto,
  UserCreateDto,
} from '@intake24-dietician/common/entities-new/user.dto'
import {
  PatientUpdateDtoSchema,
  UserCreateDtoSchema,
} from '@intake24-dietician/common/entities-new/user.dto'

export type ContactDetailsFormValues = Pick<
  PatientUpdateDto,
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
  mode: 'Add' | 'Edit'
}>()
const emit = defineEmits<{
  update: [value: ContactDetailsFormValues]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<ContactDetailsFormValues>({ ...props.defaultState })

const handleFieldUpdate = (
  fieldName: keyof ContactDetailsFormValues,
  newVal: string,
) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const formConfigNames: Form<['firstName', 'middleName', 'lastName'][number]> = {
  firstName: {
    key: 'firstName',
    label: t('profile.form.personalDetails.firstName.label'),
    required: true,
    labelSuffix: t('profile.form.personalDetails.firstName.labelSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(PatientUpdateDtoSchema.shape.firstName, value),
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
        validateWithZod(PatientUpdateDtoSchema.shape.middleName, value),
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
        validateWithZod(PatientUpdateDtoSchema.shape.lastName, value),
    ],
    handleUpdate: val => handleFieldUpdate('lastName', val),
  },
}

// eslint-disable-next-line vue/no-setup-props-destructure
const formConfigContact: Form<['mobileNumber', 'address', 'email'][number]> =
  // eslint-disable-next-line vue/no-setup-props-destructure
  {
    mobileNumber: {
      key: 'mobileNumber',
      autocomplete: 'tel',
      label: t('profile.form.contactDetails.mobileNumber.label'),
      required: false,
      type: 'input',
      inputType: 'tel',
      rules: [
        (value: string) =>
          validateWithZod(PatientUpdateDtoSchema.shape.mobileNumber, value),
      ],
      handleUpdate: val => handleFieldUpdate('mobileNumber', val),
    },
    email: {
      key: 'email',
      autocomplete: 'email',
      label: t('profile.form.contactDetails.email.label'),
      labelSuffix: t('profile.form.contactDetails.email.labelSuffix'),
      required: true,
      // readonly: props.mode === 'Edit',
      type: 'input',
      inputType: 'text',
      rules: [
        (value: string) =>
          validateWithZod(UserCreateDtoSchema.shape.email, value),
      ],
      handleUpdate: val => handleFieldUpdate('email', val),
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
          validateWithZod(PatientUpdateDtoSchema.shape.address, value),
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
