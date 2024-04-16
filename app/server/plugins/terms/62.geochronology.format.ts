import { Division, Status } from "~/types/geochronology"

export default defineMongooseFormatter(Geochronology, (doc) => {
  if (doc.__type !== Geochronology.fullName) { return }

  const { division, boundaries, gssp, uncertainty, color, status, type } = doc
  return {
    division: division && useEnum(Division).labelOf(division),
    boundaries,
    gssp,
    uncertainty,
    color,
    status: status && useEnum(Status).labelOf(status),
    type: type && `geochronology`,
  }
})
