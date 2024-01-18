<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.shortBio.title') }}
    </p>
    <v-card :width="mdAndUp ? '100%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-textarea
            :model-value="defaultState.shortBio"
            :label="t('profile.form.shortBio.placeholder')"
            append-inner-icon="mdi-restore"
            variant="solo-filled"
            @update:model-value="
              (val: string) => handleFieldUpdate('shortBio', val || null)
            "
          ></v-textarea>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'

export interface ShortBioFormValues {
  shortBio: string | null
}

defineProps<{
  defaultState: ShortBioFormValues
}>()
const emit = defineEmits<{
  update: [value: Partial<ShortBioFormValues>]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

const handleFieldUpdate = <K extends keyof ShortBioFormValues>(
  fieldName: K,
  newVal: ShortBioFormValues[K],
) => {
  emit('update', { [fieldName]: newVal })
}
</script>
