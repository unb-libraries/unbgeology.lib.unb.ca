import { Division, Status } from "~/types/geochronology"

export default defineMongooseFormatter(Geochronology, async (doc) => {
  if (doc.__type !== Geochronology.fullName) { return }

  const { division, boundaries, gssp, uncertainty, color, parent, status, type } = doc
  return {
    parent: (parent && Object.values(parent).length > 0 && await renderDocument(parent, { model: Term, self: term => `/api/terms/${term._id}` })) || undefined,
    division: division && useEnum(Division).labelOf(division),
    boundaries,
    gssp,
    uncertainty,
    color,
    status: status && useEnum(Status).labelOf(status),
    type: type && `geochronology`,
  }
})
