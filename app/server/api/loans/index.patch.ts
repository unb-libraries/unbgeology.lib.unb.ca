export default defineEventHandler(async (event) => {
  const { where: { self } = {} } = getLoanQueryParams(event)
  const { contact, ...body } = await readLoanBody(event, { optional: true })

  const query = Loan.mongoose.model.updateMany({}, {
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
