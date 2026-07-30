import type { Meta as IMeta } from "#server/documentTypes/Meta"
import { EntityFieldTypes } from "~~/types/entity"

export interface LoanMeta extends IMeta {
  yearCounter: Map<string, number>
}

export default defineDocumentModel(`Loan`, defineDocumentSchema<LoanMeta>({
  yearCounter: {
    type: EntityFieldTypes.Map,
    of: EntityFieldTypes.Number,
  },
})(), Meta)
