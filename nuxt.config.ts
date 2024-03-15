// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
    '@fortawesome/fontawesome-svg-core/styles.css'
  ],
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
    public: {
      googleInfo: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        apiKey: process.env.GOOGLE_API_KEY,
      },
    },
  },
  nitro: {
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
