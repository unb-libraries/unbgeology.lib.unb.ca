export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const migration = await Migration.deleteOne()
    .where(`_id`).eq(parseObjectID(id))

  return migration ? sendNoContent(event) : create404()
})
