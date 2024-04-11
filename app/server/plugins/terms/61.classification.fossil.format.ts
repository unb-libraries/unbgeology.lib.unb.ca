import { Rank, Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Fossil, (doc) => {
  const { rank, status, type } = doc
  return {
    rank: rank && useEnum(Rank).labelOf(rank).toLowerCase(),
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/fossil`,
  }
}, {
  enable: doc => matchInputType(doc, Classification.Fossil.fullName, {
    typeField: `__type`,
  }),
})
