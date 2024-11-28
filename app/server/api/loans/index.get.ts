import { getLoanQueryParams } from "~/server/utils/api/getLoanQuery"
import type { Loan as ILoan } from "~/types/loan"

export default defineEventHandler(async (event) => {
  const { select, filter } = getLoanQueryParams(event)

  const query = Loan.mongoose.model.find()
  if ([`gt`, `gte`, `lt`, `lte`].includes(filter.start?.[0])) {
    const date = new Date(filter.start[1])?.valueOf()
    if (!isNaN(date)) {
      query.where({ start: { [`$${filter.start[0]}`]: date } })
    }
  }

  if ([`gt`, `gte`, `lt`, `lte`].includes(filter.end?.[0])) {
    const date = new Date(filter.end[1])?.valueOf()
    if (!isNaN(date)) {
      query.where({ end: { [`$${filter.end[0]}`]: date } })
    }
  }

  if ([`eq`, `ne`].includes(filter.contact?.name?.[0])) {
    query.where({ "contact.name": { [`$${filter.contact.name[0]}`]: filter.contact.name[1] } })
  } else if (filter.contact?.name?.[0] === `rx`) {
    query.where({ "contact.name": { [`$regex`]: filter.contact.name[1] } })
  }

  if ([`eq`, `ne`].includes(filter.contact?.affiliation?.[0])) {
    query.where({ "contact.affiliation": { [`$${filter.contact.affiliation[0]}`]: filter.contact.affiliation[1] } })
  } else if (filter.contact?.affiliation?.[0] === `rx`) {
    query.where({ "contact.affiliation": { [`$regex`]: filter.contact.affiliation[1] } })
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
