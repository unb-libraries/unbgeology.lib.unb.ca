import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Mineral, (doc) => {
  if (doc.__type !== Classification.Mineral.fullName) { return }

  const { composition, status, type } = doc
  return {
    composition,
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/mineral`,
  }
})
