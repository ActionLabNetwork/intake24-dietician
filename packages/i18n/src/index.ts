import { createI18n, useI18n } from 'vue-i18n'
import messages from './portal'
import { MessageSchema } from './portal'

const options = {
  legacy: false,
  locale: 'en',
  fallbackLocale: 'id',
  messages: messages,
} as const
export type i18nOptions = typeof options

export const i18n = createI18n<
  [MessageSchema],
  'en' | 'id',
  false,
  typeof options
>(options)

export const useI24DieticianI18n = () => {
  const { t, locale } = useI18n<typeof options>()
  return { t, locale }
}
