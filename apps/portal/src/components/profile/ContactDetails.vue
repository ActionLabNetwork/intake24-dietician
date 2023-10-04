<template>
  <div>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-form v-model="form" @submit.prevent="handleSubmit">
        <v-container>
          <v-row dense justify="center" align="center">
            <v-col>
              <!-- Email address -->
              <BaseInput
                type="email"
                name="emailAddress"
                autocomplete="email"
                :value="emailAddress"
                class="base-input"
                @update="(newVal: string) => (emailAddress = newVal)"
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
                :value="mobileNumber"
                @update="(newVal: string) => (mobileNumber = newVal)"
              >
                <span class="input-label">
                  {{ t('profile.form.contactDetails.mobileNumber.label') }}
                </span>
                <span class="input-label suffix">
                  {{
                    t('profile.form.contactDetails.mobileNumber.labelSuffix')
                  }}
                </span>
              </BaseInput>
            </v-col>
            <v-col>
              <!-- Business number -->
              <BaseInput
                type="text"
                name="businessNumber"
                autocomplete="tel"
                :value="businessNumber"
                @update="(newVal: string) => (businessNumber = newVal)"
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
                :value="businessAddress"
                @update="(newVal: string) => (businessAddress = newVal)"
              >
                <span class="input-label">
                  {{ t('profile.form.contactDetails.businessAddress.label') }}
                </span>
              </BaseInput>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/form/BaseInput.vue'

import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const form = ref(null)
const emailAddress = ref('')
const mobileNumber = ref('')
const businessNumber = ref('')
const businessAddress = ref('')

const handleSubmit = () => {}
</script>
<style scoped lang="scss">
.input-label {
  color: #555555;

  &.suffix {
    color: #ee672d;
  }
}
</style>
