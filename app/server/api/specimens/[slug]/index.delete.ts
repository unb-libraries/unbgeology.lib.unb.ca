export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const specimen = await Specimen.Base.deleteOne()
    .where(`slug`).eq(slug)

  if (specimen) {
    return sendNoContent(event)
  }
  throw create404(`Specimen entity "${slug}" not found.`)
})
