export default defineMongooseReader(Specimen.Rock, async (payload, options) => {
  const create = options.op === `create`
  if (create && payload.type !== `rock`) { return {} }

  const { type } = await validateBody(payload, {
    type: requireIf(create, MatchValidator(/^rock$/)),
  })

  return {
    type: type && Specimen.Rock.mongoose.model.modelName,
  }
})
