import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Rock, (doc) => {
  if (doc.__type !== Classification.Rock.fullName) { return }

  const { status, type } = doc
  return {
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/rock`,
  }
})
