export default defineEventHandler(async (event) => {
  const {
    classifications: classificationURIs,
    editor: userURI,
    ...body
  } = await readBody(event)

  if (classificationURIs) {
    body.classifications = await Classification.findManyByURI(classificationURIs)
  }
  if (userURI) {
    body.editor = await User.findByURI(userURI)
  }

  const specimen = await Specimen.create(body)
  return sendEntity(event, specimen)
})
