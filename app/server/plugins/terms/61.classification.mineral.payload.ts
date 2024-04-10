export default defineMongooseReader(Classification.Mineral, async (payload, options) => {
  if (options.op === `create` && payload.type !== `classification/mineral`) { return {} }

  const { composition } = await validateBody(payload, {
    composition: optional(StringValidator),
  })

  return {
    composition,
    type: Classification.Mineral.fullName,
  }
})
