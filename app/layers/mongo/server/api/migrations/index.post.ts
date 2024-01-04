export default defineEventHandler(async (event) => {
  const body = await readEntityBody(event, migrationBodyReader)
  const { _id: id } = await Migration.create(body)
  return await $fetch(`/api/migrations/${id}`)
})
