export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)

  const organization = await Organization.findOneAndUpdate({ _id: id }, body, { new: true })
  return sendEntityOr404(event, organization)
})
