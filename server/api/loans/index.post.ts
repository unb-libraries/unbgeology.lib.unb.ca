import type { Loan as ILoan } from "#server/documentTypes/Loan"
import { readLoanBody } from "#server/utils/api/readLoanBody"

export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const authFields = getAuthorizedFields(event, ...resources)
  const body: Partial<ILoan> = Object.entries(await readLoanBody(event))
    .filter(([key]) => !authFields.length || authFields.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  const { _id } = (await Loan.mongoose.model.create(body))

  return {
    self: `/api/loans/${_id}`,
  }
})
