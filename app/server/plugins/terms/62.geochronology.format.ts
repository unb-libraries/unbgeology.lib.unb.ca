import { Division } from "~/types/geochronology"

export default defineMongooseFormatter(Geochronology, (doc) => {
  const { type, division, boundaries, gssp, uncertainty, color } = doc
  return {
    division: division && useEnum(Division).labelOf(division),
    boundaries,
    gssp,
    uncertainty,
    color,
    type: type && `geochronology`,
  }
})
