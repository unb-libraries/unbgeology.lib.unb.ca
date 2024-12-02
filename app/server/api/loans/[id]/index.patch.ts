export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { contact, ...body } = await readLoanBody(event, { optional: true })

  const loan = await Loan.mongoose.model.findByIdAndUpdate(id, {
    ...body,
    ...Object.fromEntries(Object
      .entries(contact ?? {})
      .map(([key, value]) => [[`contact.${key}`], value])),
  })

  if (!loan) {
    throw createError({ statusCode: 404, statusMessage: `Loan entity not found.` })
  }
  return sendNoContent(event)
})
