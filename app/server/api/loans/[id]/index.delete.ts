export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  if (!resources.length) {
    return create403()
  }

  await Loan.mongoose.model.findByIdAndDelete(id)
    .where(`authTags`).in(resources)
  return sendNoContent(event)
})
