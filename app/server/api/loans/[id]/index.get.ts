import type { Loan as ILoan } from "~/types/loan"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { select } = getLoanQueryParams(event)

  const query = Loan.mongoose.model.findById(id)
  if (select.includes(`specimens`)) {
    query.populate(`specimens`)
  }
  if (select.includes(`contract`)) {
    query.populate(`contract`)
  }

  const loan = await query
  if (!loan) {
    throw createError({ statusCode: 404, statusMessage: `Loan entity not found.` })
  }

  return {
    self: `/api/loans/${id}`,
    ...Object.fromEntries(Object.entries(loan.toJSON<ILoan>()).filter(([key]) => select.includes(key as keyof ILoan))),
  }
})
