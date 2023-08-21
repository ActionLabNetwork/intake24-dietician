import Vue from "vue"
import VueI18n from "vue-i18n"

export const i18n = VueI18n.createI18n({
  locale: "en",
  fallbackLocale: "en",
})

const app = Vue.createApp({})

app.use(i18n)
