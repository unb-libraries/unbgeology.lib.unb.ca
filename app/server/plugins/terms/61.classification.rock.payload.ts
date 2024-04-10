export default defineMongooseReader(Classification.Rock, (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/rock`) { return {} }
  return {
    type: Classification.Rock.fullName,
  }
})
