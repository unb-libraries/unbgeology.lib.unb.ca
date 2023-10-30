export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { location: locationURI, ...body } = await readBody(event)
  if (locationURI) {
    body.location = await StorageLocation.findByURI(locationURI)
  }

  const specimen = await Specimen.findByPK(slug)
  if (specimen) {
    const storage = specimen.storage.create(body)
    specimen.storage.push(storage)
    await specimen.save()
    return sendEntity(event, storage)
  }

  throw createError({ statusCode: 404 })
  
})
