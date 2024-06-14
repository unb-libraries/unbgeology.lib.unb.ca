import { Status } from "~/types/collection"

export default defineMongooseFormatter(Collection, (doc) => {
  if (doc.__type !== Collection.fullName) { return }

  const { status, type } = doc
  return {
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    type: type && `collection`,
  }
})
