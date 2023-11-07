<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.personalDetails.title') }}
    </p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <div v-if="mdAndUp">
          <v-row dense justify="center" align="center">
            <v-col cols="2" align="center">
              <div class="d-flex flex-column">
                <ImageUpload
                  :default-state="
                    defaultState.avatar || getDefaultAvatar(email)
                  "
                  @update="value => handleFieldUpdate('avatar', value)"
                />
              </div>
            </v-col>
            <v-divider vertical class="mx-5"></v-divider>
            <v-col>
              <div v-for="(config, fieldName) in formConfig" :key="fieldName">
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
                :default-state="defaultState.avatar || getDefaultAvatar(email)"
                @update="value => handleFieldUpdate('avatar', value)"
              />
            </div>
          </v-row>
          <v-divider class="my-5" />
          <v-row dense justify="center" align="center">
            <v-col>
              <div v-for="(config, fieldName) in formConfig" :key="fieldName">
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
  </div>
</template>
<script setup lang="ts">
import BaseInput from '@/components/form/BaseInput.vue'
import { useDebounceFn } from '@vueuse/core'

import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { INPUT_DEBOUNCE_TIME } from '@/constants'
import { ref } from 'vue'
import { getDefaultAvatar } from '@/utils/profile'
import { Form } from './types'
import ImageUpload from './ImageUpload.vue'
import { z } from 'zod'

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

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof PersonalDetailsFormValues, newVal: string) => {
    formValues.value[fieldName] = newVal
    emit('update', { ...formValues.value })
  },
  INPUT_DEBOUNCE_TIME,
)

const schema = {
  firstName: z.string().min(1, 'First name is required'),
}

const validateWithZod = (schema: z.ZodString, value: string) => {
  const result = schema.safeParse(value)
  if (result.success) {
    return true
  } else {
    const issue = result.error.issues[0]
    return issue ? issue.message : 'Invalid value'
  }
}

const fields = ['firstName', 'middleName', 'lastName'] as const
const formConfig: Form<(typeof fields)[number]> = {
  firstName: {
    key: 'firstName',
    label: t('profile.form.personalDetails.firstName.label'),
    required: true,
    labelSuffix: t('profile.form.personalDetails.firstName.labelSuffix'),
    type: 'input',
    inputType: 'text',
    rules: [(value: string) => validateWithZod(schema.firstName, value)],
    handleUpdate: val => handleFieldUpdate('firstName', val),
  },
  middleName: {
    key: 'middleName',
    label: t('profile.form.personalDetails.middleName.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    handleUpdate: val => handleFieldUpdate('middleName', val),
  },
  lastName: {
    key: 'lastName',
    label: t('profile.form.personalDetails.lastName.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    handleUpdate: val => handleFieldUpdate('lastName', val),
  },
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
