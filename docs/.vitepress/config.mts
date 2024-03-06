import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Intake24 Dietician",
  description: "The new clinical tool, intended to be deployed in a clinical setting, allows the dieticians to share tailored or automated feedback with their patients based on recall data provided. This clinical tool is essentially a dashboard that can be customised based on dietitians working requirements, and ensure a seamless dietician - patient experience of sharing food consumption data and feedback(s).",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
