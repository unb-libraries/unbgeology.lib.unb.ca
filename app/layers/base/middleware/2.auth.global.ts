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

  const now = new Date().valueOf()
  const { permission } = auth
  
  const { validUntil } = useCurrentSession().value.data
  const { hasPermission, isAuthenticated } = useCurrentUser()
  const expired = validUntil ? validUntil < now : false

  if (isAuthenticated.value && expired) {
    return requireLogin()
  }

  if (permission && !hasPermission(permission)) {
    // Use instead of navigateTo to avoid ERR_HTTP_HEADERS_SENT error
    if (!isAuthenticated.value && auth.redirect) {
      return requireLogin()
    }
    return abortNavigation({ statusCode: 403, message: `Unauthorized` })
  }
})
