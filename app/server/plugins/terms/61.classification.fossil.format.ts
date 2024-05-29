import { Rank, Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Fossil, async (doc) => {
  if (doc.__type !== Classification.Fossil.fullName) { return }

  const { rank, status, parent, type } = doc
  return {
    rank: rank && useEnum(Rank).labelOf(rank).toLowerCase(),
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/fossil`,
  }
})
