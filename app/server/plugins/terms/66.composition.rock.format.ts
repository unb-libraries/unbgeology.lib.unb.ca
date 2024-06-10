import { Status } from "~/types/composition"

export default defineMongooseFormatter(FossilPortion, (doc) => {
  if (doc.__type !== Composition.Rock.fullName) { return }

  const { status, type } = doc
  return {
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    type: type && `composition/rock`,
  }
})
