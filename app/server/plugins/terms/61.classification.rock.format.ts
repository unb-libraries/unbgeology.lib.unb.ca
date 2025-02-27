import { Status } from "~/types/classification"

export default defineMongooseFormatter(Classification.Rock, async (doc) => {
  if (doc.__type !== Classification.Rock.fullName) { return }

  const { description, image, status, parent, ancestors, type } = doc
  return {
    description,
    image: (Object.keys(image ?? {}).length && await renderDocument(image, { model: FileBase, self: image => `/api/files/${image._id}` })) || undefined,
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    ancestors: (ancestors && ancestors.length > 0 && await renderDocumentList(ancestors, {
      model: Term,
      canonical: {
        self: term => `/api/terms/${term._id}`,
      },
      self: () => `/api/terms/`,
    })) || undefined,
    status: status && useEnum(Status).valueOf(status),
    type: type && `classification/rock`,
  }
})
