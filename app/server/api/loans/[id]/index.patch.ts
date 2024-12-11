import type { Loan as ILoan } from "~/server/documentTypes/Loan"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const authFields = getAuthorizedFields(event, ...resources)
  const { contact, ...body }: Partial<ILoan> = Object.entries(await readLoanBody(event, { optional: true }))
    .filter(([key]) => !authFields.length || authFields.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

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
