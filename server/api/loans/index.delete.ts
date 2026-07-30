export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^loan$/.test(r))
  if (!resources.length) {
    return create403()
  }

  const { where: { self } = {} } = getLoanQueryParams(event)
  const query = Loan.mongoose.model.deleteMany({ authTags: { $in: resources } })
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
