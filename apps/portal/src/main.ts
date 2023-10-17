/**
 * Main.ts.
 *
 * Bootstraps Vuetify and other plugins then mounts the App`.
 */

// Components

// Composables
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from '@intake24-dietician/i18n/index'

// Plugins
import { registerPlugins } from './plugins'
import { VueQueryPlugin } from '@tanstack/vue-query'
// import { useToast } from 'vue-toast-notification'
// import 'vue-toast-notification/dist/theme-sugar.css'

const app = createApp(App)
registerPlugins(app)

app.use(i18n)
app.use(VueQueryPlugin)
app.mount('#app')

// const $toast = useToast()
// let instance = $toast.success('You did it!')
