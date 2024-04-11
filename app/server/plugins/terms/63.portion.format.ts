export default defineMongooseFormatter(FossilPortion, (doc) => {
  const { type } = doc
  return {
    type: type && `portion`,
  }
})
