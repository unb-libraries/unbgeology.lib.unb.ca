export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const migration = await Migration.findByID(id).select(`authTags`)
  if (migration && !migration.authTags.some(t => resources.includes(t))) {
    return create403()
  }

  await migration?.delete()
  return migration ? sendNoContent(event) : create404()
})
