export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { method } = event

  const { classifications: uris } = await readBody(event)
  const classifications = await Classification.findManyByURI(uris)

  switch (method) {
    case `POST`: await Specimen.updateOne({ slug }, { $push: { classifications }}); break
    case `PUT`: await Specimen.updateOne({ slug }, { $set: { classifications }}); break
    case `DELETE`: await Specimen.updateOne({ slug }, { $pullAll: { classifications }}); break
    default: throw createError({ statusCode: 405, statusMessage: `Method not allowed.` })
  }
  
  return await $fetch(getRequestURL(event).pathname)
})
