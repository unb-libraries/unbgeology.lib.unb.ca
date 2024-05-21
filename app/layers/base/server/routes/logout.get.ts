export default defineEventHandler(async (event) => {
  const sessionConfig = useServerSessionConfig()
  const { update } = await useSession(event, sessionConfig)
  await update((data) => {
    delete data.user
    return data
  })

  return sendRedirect(event, `/`, 302)
})
