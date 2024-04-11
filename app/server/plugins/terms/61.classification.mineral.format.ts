import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Mineral, (doc) => {
  const { composition, status, type } = doc

  return {
    composition,
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/mineral`,
  }
}, {
  enable: doc => matchInputType(doc, Classification.Mineral.fullName, {
    typeField: `__type`,
  }),
})
