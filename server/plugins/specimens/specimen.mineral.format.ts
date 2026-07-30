export default defineMongooseFormatter(Specimen.Mineral, (doc) => {
  if (doc.__type !== Specimen.Mineral.fullName) { return {} }
  const { type } = doc

  return {
    type: type && `mineral`,
  }
})
