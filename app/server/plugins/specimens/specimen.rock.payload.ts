export default defineMongooseReader(Specimen.Fossil, async (payload, options) => {
  if (options.op === `create` && payload.type !== `rock`) { return {} }

  const create = options.op === `create`
  const { classification, type } = await validateBody(payload, {
    classification: requireIf(create, URIEntityTypeValidator(`classification/rock`)),
    type: requireIf(create, MatchValidator(/^rock$/)),
  })

  return {
    classification: classification && { _id: classification.id },
    classificationModel: classification && Classification.Rock.mongoose.model.modelName,
    type: type && Specimen.Rock.mongoose.model.modelName,
  }
})
