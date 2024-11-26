import { readLoanBody } from "~/server/utils/api/readLoanBody"
import type { Loan as ILoan } from "~/types/loan"

export default defineEventHandler(async (event) => {
  const body = await readLoanBody(event)
  const { id } = (await Loan.mongoose.model.create(body))
    .toJSON<ILoan>()

  return {
    self: `/api/loans/${id}`,
    id,
  }
})
