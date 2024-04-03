import { type Term } from "~/layers/mongo/server/documentTypes/Term"

export const FossilPortion = defineDocumentModel(`Portion.Fossil`, defineDocumentSchema<Term>({
})(), Term)
