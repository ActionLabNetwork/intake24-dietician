/**
 * Plugins/index.ts.
 *
 * Automatically included in `./src/main.ts`.
 */

// Plugins
import type { App } from 'vue'
import pinia from '../store'
import router from '../router'
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'

// Types

export function registerPlugins (app: App) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
}
