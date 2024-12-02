import { getLoanQueryParams } from "~/server/utils/api/getLoanQuery"
import type { Loan as ILoan } from "~/types/loan"

export default defineEventHandler(async (event) => {
  const { select, where: { self, start, end, contract, specimens } = {} } = getLoanQueryParams(event)

  const query = Loan.mongoose.model.find()
  if (self?.eq) {
    query.where({ _id: Array.isArray(self.eq) ? { $in: self.eq.map(uri => uri.split(`/`)[3]) } : self.eq.split(`/`)[3] })
  } else if (self?.ne) {
    query.where({ _id: Array.isArray(self.ne) ? { $nin: self.ne.map(uri => uri.split(`/`)[3]) } : { $ne: self.ne.split(`/`)[3] } })
  }

  if (start?.gt) {
    query.where({ start: { $gt: new Date(start.gt)?.valueOf() } })
  } else if (start?.gte) {
    query.where({ start: { $gte: new Date(start.gte)?.valueOf() } })
  }
  if (start?.lt) {
    query.where({ start: { $lt: new Date(start.lt)?.valueOf() } })
  } else if (start?.lte) {
    query.where({ start: { $lte: new Date(start.lte)?.valueOf() } })
  }

  if (end?.gt) {
    query.where({ end: { $gt: new Date(end.gt)?.valueOf() } })
  } else if (end?.gte) {
    query.where({ end: { $gte: new Date(end.gte)?.valueOf() } })
  }
  if (end?.lt) {
    query.where({ end: { $lt: new Date(end.lt)?.valueOf() } })
  } else if (end?.lte) {
    query.where({ end: { $lte: new Date(end.lte)?.valueOf() } })
  }

  if (typeof contract === `boolean`) {
    query.where({ contract: { $exists: contract } })
  }

  if (specimens?.count?.gt || specimens?.count?.gte) {
    const count = parseInt(specimens.count.gt || specimens.count.gte as string)
    query.where({ $expr: { [specimens.count?.gt ? `$gt` : `$gte`]: [{ $size: `$specimens` }, count] } })
  }
  if (specimens?.count?.lt || specimens?.count?.lte) {
    const count = parseInt(specimens.count.lt || specimens.count.lte as string)
    query.where({ $expr: { [specimens.count?.lt ? `$lt` : `$lte`]: [{ $size: `$specimens` }, count] } })
  }

  const total = await (query.clone().countDocuments())
  select
    .filter(field => [`specimens`, `contract`].includes(field))
    .forEach(field => query.populate(field))

  return {
    self: `/api/loans`,
    entities: (await query).map(loan => ({
      self: `/api/loans/${loan._id}`,
      id: `${loan._id}`,
      ...Object.fromEntries(Object.entries(loan.toJSON<ILoan>()).filter(([key]) => select.includes(key as keyof ILoan))),
    })),
    ...usePaginator({ total }),
  }
})
