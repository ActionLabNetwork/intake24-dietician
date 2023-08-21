/**
 * Main.ts.
 *
 * Bootstraps Vuetify and other plugins then mounts the App`.
 */

// Components

// Composables
import { createApp } from "vue";
import { createI18n } from "vue-i18n";
import App from "./App.vue";

// Plugins
import { registerPlugins } from "@/plugins";

const i18n = createI18n({
  locale: "en",
  messages: {
    en: {
      message: {
        hello: "hello world",
      },
    },
    ja: {
      message: {
        hello: "こんにちは、世界",
      },
    },
  },
});
const app = createApp(App);

registerPlugins(app);

app.use(i18n);
app.mount("#app");
