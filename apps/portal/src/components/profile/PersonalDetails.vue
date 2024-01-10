<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.personalDetails.title') }}
    </p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <div>
          <v-row dense justify="center" align="center">
            <v-col :cols="mdAndUp ? 2 : 3" align="center">
              <div class="d-flex flex-column">
                <ImageUpload
                  :default-state="defaultState.avatar || getDefaultAvatar()"
                  @update="value => handleFieldUpdate('avatar', value)"
                />
              </div>
            </v-col>
            <v-divider
              :vertical="mdAndUp"
              :class="{ 'mx-5': mdAndUp, 'my-5': !mdAndUp }"
            />
            <v-col :cols="mdAndUp ? 9 : 12">
              <div v-for="(config, fieldName) in formConfig" :key="fieldName">
                <div v-if="config.type === 'input'">
                  <BaseInput
                    :type="config.inputType"
                    :name="config.key"
                    :rules="config.rules"
                    :autocomplete="config.autocomplete"
                    :value="formValues[fieldName]"
                    :suffix-icon="config.suffixIcon"
                    :handle-icon-click="config.handleSuffixIconClick"
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
  </div>
</template>
<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'

import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { getDefaultAvatar } from '@/utils/profile'
import { Form } from './types'
import ImageUpload from './ImageUpload.vue'
import { validateWithZod } from '@intake24-dietician/portal/validators'
import { DieticianUpdateDto } from '@intake24-dietician/common/entities-new/user.dto'

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

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<PersonalDetailsFormValues>(props.defaultState)

const handleFieldUpdate = (
  fieldName: keyof PersonalDetailsFormValues,
  newVal: string,
) => {
  formValues.value[fieldName] = newVal
  emit('update', { ...formValues.value })
}

const formConfig: Form<keyof Omit<PersonalDetailsFormValues, 'avatar'>> = {
  firstName: {
    key: 'firstName',
    label: t('profile.form.personalDetails.firstName.label'),
    required: true,
    labelSuffix: t('profile.form.personalDetails.firstName.labelSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [
      (value: string) =>
        validateWithZod(DieticianUpdateDto.shape.firstName, value),
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
        validateWithZod(DieticianUpdateDto.shape.middleName, value),
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
        validateWithZod(DieticianUpdateDto.shape.lastName, value),
    ],
    handleUpdate: val => handleFieldUpdate('lastName', val),
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
