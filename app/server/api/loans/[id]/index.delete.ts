export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  await Loan.mongoose.model.findByIdAndDelete(id)
  return sendNoContent(event)
})
