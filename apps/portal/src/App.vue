<template>
  <router-view />
</template>

<script lang="ts" setup>
import { i18nOptions } from '@intake24-dietician/i18n'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '@/stores/i18n'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useFavicon } from '@vueuse/core'

// Stores
const i18nStore = useI18nStore()

const { locale } = useI18n<i18nOptions>()
const { systemLocale } = storeToRefs(i18nStore)

useFavicon('logo.svg', { baseUrl: '/src/assets/', rel: 'icon' })

watch(
  () => systemLocale.value,
  newVal => {
    locale.value = newVal
  },
  { immediate: true },
)
</script>
