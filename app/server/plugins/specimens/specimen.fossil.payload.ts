export default defineMongooseReader(Specimen.Fossil, async (payload, options) => {
  if (options.op === `create` && payload.type !== `fossil`) { return {} }

  const create = options.op === `create`
  const { classification, portion, type } = await validateBody(payload, {
    classification: requireIf(create, URIEntityTypeValidator(`classification/fossil`)),
    portion: optional(URIEntityTypeValidator(`portion`)),
    type: requireIf(create, MatchValidator(/^fossil$/)),
  })

  return {
    classification: classification && { _id: classification.id },
    classificationModel: classification && Classification.Fossil.mongoose.model.modelName,
    portion: portion && { _id: portion.id },
    type: type && Specimen.Fossil.mongoose.model.modelName,
  }
})
