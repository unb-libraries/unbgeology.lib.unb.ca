export default defineEventHandler(async (event) => {
  const { slug, sid } = getRouterParams(event)

  const specimen = await Specimen.findByPK(slug)
    .populate(`storage.location`, `_id`)
  const storage = specimen.storage.id(sid)

  return sendEntity(event, storage)
})
