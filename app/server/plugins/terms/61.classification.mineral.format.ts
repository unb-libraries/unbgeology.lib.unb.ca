export default defineMongooseFormatter(Classification.Mineral, (doc) => {
  const { composition, type } = doc

  return {
    composition,
    type: type && `classification/mineral`,
  }
}, {
  enable: doc => matchInputType(doc, Classification.Mineral.fullName, {
    typeField: `__type`,
  }),
})
