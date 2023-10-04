import { LanguageCode, languages } from '@intake24-dietician/i18n'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useI18nStore = defineStore('i18n', () => {
  const systemLocale = useStorage<LanguageCode>(
    'system-locale',
    languages[0].code,
    localStorage,
  )

  return { systemLocale }
})
