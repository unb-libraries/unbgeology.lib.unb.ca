export async function useCurrentUser(): Promise<{ user: string, permissions: string[] } | undefined> {
  const { session } = await useCurrentSession()
  const { user, permissions } = (session.value!.data ?? {}) as { user: string, permissions: string[] }
  return user
    ? {
        user,
        permissions,
      }
    : undefined
}
