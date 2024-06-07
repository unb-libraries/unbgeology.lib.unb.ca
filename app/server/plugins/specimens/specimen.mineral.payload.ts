export default defineMongooseReader(Specimen.Mineral, async (payload, options) => {
  const create = options.op === `create`
  if (create && payload.type !== `mineral`) { return {} }

  const { type } = await validateBody(payload, {
    type: requireIf(create, MatchValidator(/^mineral$/)),
  })

  return {
    type: type && Specimen.Mineral.mongoose.model.modelName,
  }
})
