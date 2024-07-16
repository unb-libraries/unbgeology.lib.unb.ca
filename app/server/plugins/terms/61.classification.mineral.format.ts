import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Mineral, async (doc) => {
  if (doc.__type !== Classification.Mineral.fullName) { return }

  const { composition, status, parent, ancestors, type } = doc
  return {
    composition,
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    ancestors: (ancestors && ancestors.length > 0 && await renderDocumentList(ancestors, {
      model: Term,
      canonical: {
        self: term => `/api/terms/${term._id}`,
      },
      self: () => `/api/terms/`,
    })) || undefined,
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/mineral`,
  }
})
