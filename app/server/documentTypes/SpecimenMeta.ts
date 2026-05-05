import type { Meta as IMeta } from "~/server/documentTypes/Meta"
import { EntityFieldTypes } from "~/types/entity"

export interface SpecimenMeta extends IMeta {
  yearCounter: Map<string, number>
}

export default defineDocumentModel(`Specimen`, defineDocumentSchema<SpecimenMeta>({
  yearCounter: {
    type: EntityFieldTypes.Map,
    of: EntityFieldTypes.Number,
  },
})(), Meta)
