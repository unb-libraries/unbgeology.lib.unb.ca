import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Rock, async (doc) => {
  if (doc.__type !== Classification.Rock.fullName) { return }

  const { status, parent, type } = doc
  return {
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/rock`,
  }
})
