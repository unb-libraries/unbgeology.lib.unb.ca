import type { Loan as ILoan } from "~/server/documentTypes/Loan"

export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const { where: { self } = {} } = getLoanQueryParams(event)
  const { contact, ...body }: Partial<ILoan> = Object.entries(await readLoanBody(event, { optional: true }))
    .filter(([key]) => fields.includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

  const query = Loan.mongoose.model.updateMany({ authTags: { $in: resources } }, {
    ...body,
    ...Object.fromEntries(Object.entries(contact ?? {}).map(([key, value]) => [[`contact.${key}`], value])),
  }, { new: true })

  if (self?.eq) {
    query.where({ _id: Array.isArray(self.eq) ? { $in: self.eq.map(uri => uri.split(`/`)[3]) } : self.eq.split(`/`)[3] })
  } else if (self?.ne) {
    query.where({ _id: Array.isArray(self.ne) ? { $nin: self.ne.map(uri => uri.split(`/`)[3]) } : { $ne: self.ne.split(`/`)[3] } })
  }

  const { modifiedCount: modified } = await query

  return {
    self: `/api/loans`,
    modified,
  }
})
