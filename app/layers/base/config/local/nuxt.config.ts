export default defineNuxtConfig({
  extends: [
    `../dev`,
    `../prod`,
  ],
  runtimeConfig: {
    nitro: {
      defaultUser(event) {
        return /^\/api(?!\/session)/.test(getRequestURL(event).pathname) && `admin`
      },
    },
    session: {
      cookie: {
        secure: false,
      },
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
  },
})
