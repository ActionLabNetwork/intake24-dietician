/**
 * Main.ts.
 *
 * Bootstraps Vuetify and other plugins then mounts the App`.
 */

// Components

// Composables
import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from '@intake24-dietician/i18n'

// Plugins
import { registerPlugins } from './plugins'
import { VueQueryPlugin } from '@tanstack/vue-query'

const app = createApp(App)
registerPlugins(app)

app.use(i18n)
app.use(VueQueryPlugin)
app.mount('#app')
