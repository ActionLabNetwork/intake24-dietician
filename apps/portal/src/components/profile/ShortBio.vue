<template>
  <div>
    <p class="font-weight-medium">
      {{ t('profile.form.shortBio.title') }}
    </p>
    <v-card :width="mdAndUp ? '75%' : '100%'" class="mt-5">
      <v-container>
        <v-row dense justify="center" align="center">
          <v-textarea
            v-model="formValues.shortBio"
            :label="t('profile.form.shortBio.placeholder')"
            append-inner-icon="mdi-restore"
            variant="solo-filled"
            @click:append-inner="
              () => {
                formValues.shortBio = defaultState.shortBio
                emit('update', { ...formValues })
              }
            "
            @update:model-value="
              (val: string) => handleFieldUpdate('shortBio', val)
            "
          ></v-textarea>
        </v-row>
      </v-container>
    </v-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

import { i18nOptions } from '@intake24-dietician/i18n/index'
import { useI18n } from 'vue-i18n'
import { useDebounceFn } from '@vueuse/core'
import { INPUT_DEBOUNCE_TIME } from '@/constants'

export interface ShortBioFormValues {
  shortBio: string
}

const props = defineProps<{
  defaultState: ShortBioFormValues
}>()
const emit = defineEmits<{
  update: [value: ShortBioFormValues]
}>()

const { mdAndUp } = useDisplay()

const { t } = useI18n<i18nOptions>()

// eslint-disable-next-line vue/no-setup-props-destructure
const formValues = ref<ShortBioFormValues>({
  shortBio: props.defaultState.shortBio ?? '',
})

const handleFieldUpdate = useDebounceFn(
  (fieldName: keyof ShortBioFormValues, newVal: string) => {
    formValues.value[fieldName] = newVal
    emit('update', { ...formValues.value })
  },
  INPUT_DEBOUNCE_TIME,
)
</script>
