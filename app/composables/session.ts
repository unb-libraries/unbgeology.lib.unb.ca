import { type UserSession } from "../types/session"

export function useCurrentSession() {
  return useState<UserSession>(`session`)
}

export function useCurrentUser() {
  const session = useCurrentSession()
  return {
    id: computed(() => session.value!.data.id),
    username: computed(() => session.value!.data.user),
    isAuthenticated: computed(() => session.value!.data.authenticated),
    profile: computed(() => session.value!.data.profile),
    hasPermission: (permission: string | string[] | RegExp) => {
      return session.value!.data.permissions.some(p => permission instanceof RegExp
        ? permission.test(p)
        : Array.isArray(p)
          ? p.includes(permission)
          : p === permission)
    },
  }
}

export function useSessionConfig() {
  return {
    ...useRuntimeConfig().public.session,
    ...useRuntimeConfig().session,
  }
}
