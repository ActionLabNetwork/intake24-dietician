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
            <v-form v-model="form" @submit.prevent="handleSubmit">
              <!-- First name -->
              <BaseInput
                type="text"
                name="firstName"
                autocomplete="given-name"
                :value="firstName"
                class="base-input"
                @update="(newVal: string) => (firstName = newVal)"
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
                :value="middleName"
                @update="(newVal: string) => (middleName = newVal)"
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
                :value="lastName"
                @update="(newVal: string) => (lastName = newVal)"
              >
                <p class="input-label">
                  {{ t('profile.form.personalDetails.lastName.label') }}
                </p>
              </BaseInput>
            </v-form>
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

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const form = ref(null)
const firstName = ref('')
const middleName = ref('')
const lastName = ref('')

const handleSubmit = () => {}
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
