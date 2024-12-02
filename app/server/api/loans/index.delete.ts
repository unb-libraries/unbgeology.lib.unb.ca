export default defineEventHandler(async (event) => {
  const { where: { self } = {} } = getLoanQueryParams(event)

  const query = Loan.mongoose.model.deleteMany()
  if (self?.eq) {
    query.where({ _id: Array.isArray(self.eq) ? { $in: self.eq.map(uri => uri.split(`/`)[3]) } : self.eq.split(`/`)[3] })
  } else if (self?.ne) {
    query.where({ _id: Array.isArray(self.ne) ? { $nin: self.ne.map(uri => uri.split(`/`)[3]) } : { $ne: self.ne.split(`/`)[3] } })
  }

  const { deletedCount: deleted } = await query

  return {
    self: `/api/loans`,
    deleted,
  }
})
