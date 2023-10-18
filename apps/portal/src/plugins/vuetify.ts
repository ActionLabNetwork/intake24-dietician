/**
 * Plugins/vuetify.ts.
 *
 * Framework documentation: https://vuetifyjs.com`.
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'
import {
  VDataTable,
  VDataTableServer,
  VDataTableVirtual,
} from 'vuetify/lib/labs/components.mjs'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#EE672D',
          secondary: '#5CBBF6',
          success: '#24773C',
          warning: '#FFB801',
          accent: '#C2ACFF',
        },
      },
    },
  },
  components: {
    VDataTable,
    VDataTableServer,
    VDataTableVirtual,
  },
})
