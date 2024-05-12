// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      bodyAttrs: {
        class: '[&_:focus]:outline-none [&_:focus-visible]:ring-2 [&_:focus-visible]:ring-accent [&_:focus-visible]:ring-offset',

      },
      script: [
        // Plausible Analytics
        { defer: true, 'data-domain': 'quando.events', src: 'https://statistics.filippo-orru.com/psb.js' },
      ],
    },
  },
  css: [
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  routeRules: {
    '/': { prerender: false },
    '/meeting/:meetingId': { ssr: false },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  build: {
    transpile: [
      "@fortawesome/vue-fontawesome"
    ],
  },
  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', "@nuxt/image"],
  runtimeConfig: {
    redis: {
      host: process.env.REDIS_HOST,
    },
    public: {
      googleInfo: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        apiKey: process.env.GOOGLE_API_KEY,
      },
    },
  },
  nitro: {
    baseURL: '/',
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
    experimental: {
      websocket: true
    },
  },
});