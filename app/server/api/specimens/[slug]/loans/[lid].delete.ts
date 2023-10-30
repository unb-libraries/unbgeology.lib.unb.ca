export default defineEventHandler(async (event) => {
  const { slug, lid } = getRouterParams(event)
  
  const specimen = await Specimen.findByPK(slug)
  specimen.loans?.pull(lid)
  await specimen.save()
  
  return sendNoContent(event)
})
