<template>
  <v-btn rounded variant="text"> Change language </v-btn>
  <v-select
    label="Language"
    :items="_languages"
    :model-value="selectedLanguage"
    @update:model-value="newVal => (selectedLanguage = newVal)"
  ></v-select>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { languages } from '@intake24-dietician/i18n'
import { useI18nStore } from '@/stores/i18n'
import { storeToRefs } from 'pinia'

const i18nStore = useI18nStore()
const { systemLocale } = storeToRefs(i18nStore)

const _languages = ref(
  languages.map(lang => ({
    title: `${lang.name} (${lang.code.toLocaleUpperCase()}) ${lang.flag}`,
    value: lang.code,
  })),
)
const selectedLanguage = ref(systemLocale.value)

watch(selectedLanguage, newVal => {
  systemLocale.value = newVal
})
</script>
