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
            <VBaseInput
              :type="fieldConfig.inputType"
              :name="fieldName"
              :suffix-icon="fieldConfig.suffixIcon"
              :handle-icon-click="fieldConfig.handleSuffixIconClick"
              :readonly="fieldConfig.readonly"
            >
              <span class="input-label">
                {{ fieldConfig.label }}
              </span>
              <span v-if="fieldConfig.labelSuffix" class="input-label suffix">
                {{ fieldConfig.labelSuffix }}
              </span>
            </VBaseInput>
          </v-col>
          <v-dialog v-model="changeEmailDialog" max-width="90vw">
            <v-card>
              <v-card-title>Change Email</v-card-title>
              <v-card-text>
                <VBaseInput
                  name="currentEmail"
                  type="email"
                  :value="email.current"
                  readonly
                >
                  <span class="input-label">
                    {{ t('profile.form.contactDetails.email.label') }}
                  </span>
                </VBaseInput>
                <VBaseInput name="newEmail" type="email" :value="email.new">
                  <span class="input-label">
                    New {{ t('profile.form.contactDetails.email.label') }}
                  </span>
                </VBaseInput>
              </v-card-text>
              <v-card-actions>
                <v-btn
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
import VBaseInput from '../form/VBaseInput.vue'
import { useRequestEmailChange } from '@/mutations/useAuth'
import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toast-notification'
import { useDisplay } from 'vuetify'
import type { Form, Layout } from './types'

export interface ContactDetailsFormValues {
  currentEmail: string
  mobileNumber: string | null
  businessNumber: string | null
  businessAddress: string | null
}

const props = defineProps<{
  email: { current: string; new: string }
  allowEmailChange?: boolean
}>()

const requestEmailChangeMutation = useRequestEmailChange()
const $toast = useToast()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const shouldShowDivider = (layout: Layout) => {
  return (
    layout.cols === 12 && !layout.sm && !layout.md && !layout.lg && !layout.xl
  )
}

const changeEmailDialog = ref(false)

const _allowEmailChange = computed(() => {
  return props.allowEmailChange ?? false
})

const requestEmailChange = async () => {
  requestEmailChangeMutation.mutate(
    { newEmail: props.email.new },
    {
      onError: () => {
        $toast.error('Failed to request to change the email.')
      },
      onSettled: () => {
        changeEmailDialog.value = false
      },
    },
  )
}

const formConfig = computed<Form<keyof ContactDetailsFormValues>>(() => ({
  currentEmail: {
    key: 'currentEmail',
    autocomplete: 'email',
    label: t('profile.form.contactDetails.email.label'),
    labelSuffix: t('profile.form.contactDetails.email.labelSuffix'),
    required: true,
    readonly: true,
    type: 'input',
    inputType: 'email',
    layout: { cols: 12, md: 4 },
    suffixIcon: _allowEmailChange.value ? 'mdi-mail' : '',
    handleSuffixIconClick: () => {
      changeEmailDialog.value = true
    },
  },
  mobileNumber: {
    key: 'mobileNumber',
    autocomplete: 'tel',
    label: t('profile.form.contactDetails.mobileNumber.label'),
    required: true,
    type: 'input',
    inputType: 'tel',
    layout: { cols: 12, md: 4 },
  },
  businessNumber: {
    key: 'businessNumber',
    label: t('profile.form.contactDetails.businessNumber.label'),
    required: false,
    type: 'input',
    inputType: 'tel',
    layout: { cols: 12, md: 4 },
  },
  businessAddress: {
    key: 'businessAddress',
    autocomplete: 'address-level3',
    label: t('profile.form.contactDetails.businessAddress.label'),
    required: false,
    type: 'input',
    inputType: 'text',
    layout: { cols: 12 },
  },
}))
</script>
<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
