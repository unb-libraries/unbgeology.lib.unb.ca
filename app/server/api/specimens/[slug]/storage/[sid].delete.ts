export default defineEventHandler(async (event) => {
  const { slug, sid } = getRouterParams(event)

  const specimen = await Specimen.findByPK(slug)
  specimen.storage.pull(sid)
  await specimen.save()

  return sendNoContent(event)
})
