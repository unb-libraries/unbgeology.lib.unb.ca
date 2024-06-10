export default defineMongooseFormatter(Specimen.Fossil, async (doc) => {
  if (doc.__type !== Specimen.Fossil.fullName) { return {} }
  const { portion, type } = doc

  return {
    portion: (portion && Object.keys(portion).length > 0 && await renderDocument(portion, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    type: type && `fossil`,
  }
})
