import type { PageMeta } from "#app"

export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith(`/login`)) {
    return
  }
  
  const requireLogin = () => {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }

  const auth: PageMeta[`auth`] = {
    redirect: false,
    ...to.meta.auth || {},
  }

  const { session, loggedIn } = useUserSession()
  const validUntil = session.value?.validUntil
  const now = new Date().valueOf()
  const expired = validUntil ? validUntil < now : false

  if (loggedIn.value && expired) {
    return requireLogin()
  }

  if (auth.permission && !usePermissions(auth.permission).value.length) {
    if (!loggedIn.value && auth.redirect) {
      return requireLogin()
    }
    return abortNavigation({ statusCode: 403, message: `Unauthorized` })
  }
})
