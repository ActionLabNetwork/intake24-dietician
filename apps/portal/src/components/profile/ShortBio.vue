<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.shortBio.title') }}
    </p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-textarea
            v-model="value"
            clearable
            name="shortBio"
            :label="t('profile.form.shortBio.placeholder')"
            :error-messages="errorMessage"
            variant="solo-filled"
          ></v-textarea>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import type { i18nOptions } from '@intake24-dietician/i18n/index'
import { useField } from 'vee-validate'
import { useI18n } from 'vue-i18n'
import { useDisplay } from 'vuetify'

export interface ShortBioFormValues {
  shortBio: string | null
}

const { mdAndUp } = useDisplay()
const { t } = useI18n<i18nOptions>()

const { value, errorMessage } = useField<string>('shortBio')
</script>
