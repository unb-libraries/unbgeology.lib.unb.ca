import type { Loan } from "~/server/documentTypes/Loan"
import { readLoanBody } from "~/server/utils/api/readLoanBody"

export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body: Partial<Loan> = Object.entries(await readLoanBody(event))
    .filter(([key]) => fields.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  const { _id } = (await Loan.mongoose.model.create(body))

  return {
    self: `/api/loans/${_id}`,
  }
})
