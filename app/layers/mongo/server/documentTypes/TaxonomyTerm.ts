import { Hierarchical, type Hierarchical as IMxHierarchical } from "../utils/mixins"
import TermBase, { type Term as TermDocument } from "./Term"

export interface TaxonomyTerm extends IMxHierarchical, TermDocument {
}

const Schema = defineDocumentSchema<TaxonomyTerm>({
}).mixin(Hierarchical<TaxonomyTerm>({ sort: `label` }))

export default defineDocumentModel<TermDocument, TaxonomyTerm>(`TaxonomyTerm`, Schema(), TermBase)
