import { readLoanBody } from "~/server/utils/api/readLoanBody"

export default defineEventHandler(async (event) => {
  const body = await readLoanBody(event)
  const { _id } = (await Loan.mongoose.model.create(body))

  return {
    self: `/api/loans/${_id}`,
  }
})
