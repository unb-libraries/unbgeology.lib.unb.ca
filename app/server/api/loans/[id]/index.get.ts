import type { Loan as ILoan } from "~/types/loan"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const { select } = getLoanQueryParams(event)
  const fields = getAuthorizedFields(event, ...resources).filter(field => select.includes(field))

  const query = Loan.mongoose.model.findById(id).where(`authTags`).in(resources)
  if (select.includes(`specimens`)) {
    // TODO: check for authTags in specimens
    query.populate(`specimens`)
  }
  if (select.includes(`contract`)) {
    // TODO: check for authTags in contract
    query.populate(`contract`)
  }

  const loan = await query
  if (!loan) {
    throw createError({ statusCode: 404, statusMessage: `Loan entity not found.` })
  }

  return {
    self: `/api/loans/${id}`,
    ...Object.fromEntries(Object.entries(loan.toJSON<ILoan>()).filter(([key]) => fields.includes(key as keyof ILoan))),
  }
})
