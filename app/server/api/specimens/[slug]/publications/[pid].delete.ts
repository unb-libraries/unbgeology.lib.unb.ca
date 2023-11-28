export default defineEventHandler(async (event) => {
  const { slug, pid } = getRouterParams(event)

  const specimen = await Specimen.findBySlug(slug)
  specimen.publications?.pull(pid)
  await specimen.save()

  return sendNoContent(event)
})
