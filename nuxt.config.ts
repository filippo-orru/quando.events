// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      'link': [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      bodyAttrs: {
        class: '[&_:focus]:outline-none [&_:focus-visible]:ring-2 [&_:focus-visible]:ring-accent [&_:focus-visible]:ring-offset',

      },
    },
  },
  css: [
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
  routeRules: {
    '/': { prerender: true },
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
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],
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
    baseURL: 'https://quando.events',
    prerender: {
      crawlLinks: true,
      failOnError: false, 
    },
    experimental: {
      websocket: true
    },
    storage: {
      "redis:users": {
        driver: 'redis',
        host: '127.0.0.1',
        port: 6379,
      },
      "redis:meetings": {
        driver: 'redis',
        host: '127.0.0.1',
        port: 6379,
      },
    },
  },
});
