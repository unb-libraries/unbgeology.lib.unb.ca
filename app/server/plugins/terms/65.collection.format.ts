import { Status } from "~/types/collection"

export default defineMongooseFormatter(Collection, (doc) => {
  if (doc.__type !== Collection.fullName) { return }

  const { status, type } = doc
  console.log(`status: ${status}, type: ${type}`)
  return {
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    type: type && `collection`,
  }
})
