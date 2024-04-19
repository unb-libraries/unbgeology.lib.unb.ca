export default defineMongooseReader(Specimen.Fossil, async (payload, options) => {
  if (options.op === `create` && payload.type !== `mineral`) { return {} }

  const create = options.op === `create`
  const { classification, type } = await validateBody(payload, {
    classification: requireIf(create, URIEntityTypeValidator(`classification/mineral`)),
    type: requireIf(create, MatchValidator(/^mineral$/)),
  })

  return {
    classification: classification && { _id: classification.id },
    classificationModel: classification && Classification.Mineral.mongoose.model.modelName,
    type: type && Specimen.Mineral.mongoose.model.modelName,
  }
})
