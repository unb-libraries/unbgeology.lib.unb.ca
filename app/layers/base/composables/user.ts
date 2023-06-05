export async function useCurrentUser() {
  const { session } = await useCurrentSession()
  return session.value!.data.user
}
