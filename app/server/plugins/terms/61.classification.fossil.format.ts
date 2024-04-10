import { Rank } from "~/types/classification"

export default defineMongooseFormatter(Classification.Fossil, (doc) => {
  const { rank, type } = doc
  return {
    rank: rank && useEnum(Rank).labelOf(rank).toLowerCase(),
    type: type && `classification/fossil`,
  }
}, {
  enable: doc => matchInputType(doc, Classification.Fossil.fullName, {
    typeField: `__type`,
  }),
})
