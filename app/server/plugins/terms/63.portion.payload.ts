export default defineMongooseReader(FossilPortion, (payload, options) => {
  if (options.op === `update` || payload.type !== `portion`) { return {} }
  return {
    type: FossilPortion.fullName,
  }
})
