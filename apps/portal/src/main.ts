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
import { VueQueryPlugin, VueQueryPluginOptions } from '@tanstack/vue-query'

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        retry: 2,
      },
    },
  },
}

const app = createApp(App)
registerPlugins(app)

app.use(i18n)
app.use(VueQueryPlugin, vueQueryPluginOptions)
app.mount('#app')
