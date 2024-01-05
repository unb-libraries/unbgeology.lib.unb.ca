export default defineEventHandler(async (event) => {
  const body = await readEntityBody(event, migrationBodyReader)
  const { _id: id } = await Migration.create(body)
  useNitroApp().hooks.callHook(`migrate`, id)
  return await $fetch(`/api/migrations/${id}`)
})
