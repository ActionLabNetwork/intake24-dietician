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

useFavicon('favicon.ico', { baseUrl: '/src/assets/favicon/', rel: 'icon' })

watch(
  () => systemLocale.value,
  newVal => {
    locale.value = newVal
  },
  { immediate: true },
)
</script>

<style>
body {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.body-gradient-wrapper {
  background: rgb(252, 249, 244);
  background: -moz-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: -webkit-linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  background: linear-gradient(
    180deg,
    rgba(252, 249, 244, 1) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#fcf9f4",endColorstr="#ffffff",GradientType=1);
}
</style>
