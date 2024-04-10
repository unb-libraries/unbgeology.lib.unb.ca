export default defineMongooseFormatter(Classification.Rock, (doc) => {
  const { type } = doc
  return {
    type: type && `classification/rock`,
  }
}, {
  enable: doc => matchInputType(doc, Classification.Rock.fullName, {
    typeField: `__type`,
  }),
})
