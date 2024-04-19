export default defineMongooseFormatter(Specimen.Fossil, async (doc) => {
  const { portion, type } = doc

  return {
    portion: portion && await renderDocument(portion, { model: Term, self: term => `/api/terms/${term._id}` }),
    type: type && `fossil`,
  }
})
