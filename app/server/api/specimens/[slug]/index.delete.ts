export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const specimen = await Specimen.findBySlugAndDelete(slug)
  if (specimen) {
    return sendNoContent(event)
  }
  throw createError({ statusCode: 404, statusMessage: `Specimen entity "${slug}" not found.` })
})
