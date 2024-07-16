import { Division, Status } from "~/types/geochronology"

export default defineMongooseFormatter(Geochronology, async (doc) => {
  if (doc.__type !== Geochronology.fullName) { return }

  const { division, start, gssp, uncertainty, color, parent, ancestors, status, type } = doc
  return {
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    ancestors: (ancestors && ancestors.length > 0 && await renderDocumentList(ancestors, {
      model: Term,
      canonical: {
        self: term => `/api/terms/${term._id}`,
      },
      self: () => `/api/terms/`,
    })) || undefined,
    division: division && useEnum(Division).labelOf(division).toLowerCase(),
    start,
    gssp,
    uncertainty,
    color,
    status: status && useEnum(Status).labelOf(status).toLowerCase(),
    type: type && `geochronology`,
  }
})
