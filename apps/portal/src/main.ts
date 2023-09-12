/**
 * Main.ts.
 *
 * Bootstraps Vuetify and other plugins then mounts the App`.
 */

// Components

// Composables
import { createApp } from 'vue'
import App from './App.vue'
import { useI18n } from '@intake24-dietician/i18n'

// Plugins
import { registerPlugins } from './plugins'

const i18n = useI18n().i18n

const app = createApp(App)
registerPlugins(app)

app.use(i18n)
app.mount('#app')
