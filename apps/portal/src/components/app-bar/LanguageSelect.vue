<template>
  <v-select v-model="selectedLanguage" label="Language" :items="_languages" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { languages } from '@intake24-dietician/i18n'
import { useI18nStore } from '@/stores/i18n'
import { storeToRefs } from 'pinia'
import { VSelect } from 'vuetify/components/VSelect'

const i18nStore = useI18nStore()
const { systemLocale } = storeToRefs(i18nStore)

// List of languages for the dropdown
const selectedLanguage = ref(systemLocale.value)
const _languages = ref(
  languages.map(lang => ({
    title: `${lang.name} (${lang.code.toLocaleUpperCase()}) ${lang.flag}`,
    value: lang.code,
  })),
)

watch(selectedLanguage, newVal => {
  systemLocale.value = newVal
})
</script>
