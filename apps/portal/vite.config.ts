// Plugins
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import tsconfigPaths from 'vite-tsconfig-paths'

// Utilities
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths({ loose: true }),
    vue({
      template: { transformAssetUrls },
      script: {
        defineModel: true,
      },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
    vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@intake24-dietician/db': fileURLToPath(
        new URL('../../packages/db/src', import.meta.url),
      ),
      '@intake24-dietician/db-new': fileURLToPath(
        new URL('../../packages/db-new/src', import.meta.url),
      ),
      '@intake24-dietician/common/': fileURLToPath(
        new URL('../../packages/common/src/*', import.meta.url),
      ),
      '@intake24-dietician/api-new/': fileURLToPath(
        new URL('../apps/api-new/src/*', import.meta.url),
      ),
      '@intake24-dietician/i18n': fileURLToPath(
        new URL('../../packages/i18n/src', import.meta.url),
      ),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
})
