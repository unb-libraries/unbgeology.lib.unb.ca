export default defineMongooseFormatter(Specimen.Rock, (doc) => {
  if (doc.__type !== Specimen.Rock.fullName) { return {} }
  const { type } = doc

  return {
    type: type && `rock`,
  }
})
