import { createI18n } from 'vue-i18n'
// import messages from './portal'

const messages1 = {
  en: {
    message: {
      hello: 'hello world',
    },
  },
  ja: {
    message: {
      hello: 'こんにちは、世界',
    },
  },
}

type MessageSchema = typeof messages1.en

export const i18n = createI18n<[MessageSchema], 'en' | 'ja'>({
  locale: 'en',
  fallbackLocale: 'ja',
  messages: messages1,
})
