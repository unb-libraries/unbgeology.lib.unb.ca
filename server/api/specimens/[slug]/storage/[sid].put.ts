export default defineEventHandler(async (event) => {
  const { slug, sid } = getRouterParams(event)
  const body = await readBody(event)

  const specimen = await Specimen.findBySlug(slug)
    .populate(`storage.location`, `_id`)
  const storage = specimen.storage.id(sid)
  for (const field in body) {
    storage[field] = body[field]
  }
  await specimen.save()

  return sendEntity(event, storage)
})
