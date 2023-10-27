export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  function getSelectedClassificationFields() {
    const fields = getSelectedFields(select, `classifications`)
    return fields.length > 0 ? fields : [`_id`]
  }
  
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

  const specimen = await Specimen.findOneAndUpdate({ slug }, body, { new: true })
    .populate(`classifications`, getSelectedClassificationFields())
    .select(getSelectedFields(select))
  
  return sendEntityOr404(event, specimen)
})