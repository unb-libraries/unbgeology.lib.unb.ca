export default defineMongooseReader(Specimen.Fossil, async (payload, options) => {
  const create = options.op === `create`
  if (create && payload.type !== `fossil`) { return {} }

  const { portion, type } = await validateBody(payload, {
    portion: optional(MatchValidator(/^\/api\/terms\/[a-z0-9]{24}$/)),
    type: optional(MatchValidator(/^fossil$/)),
  })

  return {
    portion: portion && { _id: portion.split(`/`).at(-1) },
    type: type && Specimen.Fossil.mongoose.model.modelName,
  }
})
