export default defineEventHandler(async (event) => {
  const body = await readEntityBody(event, migrationBodyReader)
  const { _id: id } = await Migration.create(body)
  return $fetch(`/api/migrations/${id}`)
})
