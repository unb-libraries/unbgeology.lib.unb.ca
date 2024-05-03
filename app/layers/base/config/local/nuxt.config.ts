export default defineNuxtConfig({
  extends: [
    `../dev`,
    `../prod`,
  ],
  runtimeConfig: {
    defaultUser: `admin`,
    session: {
      cookie: {
        secure: false,
      },
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },
})
