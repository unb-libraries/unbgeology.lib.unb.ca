import { type ObjectId } from "mongoose"
import { Hierarchical, type Hierarchical as IMxHierarchical } from "../utils/mixins"
import TermBase, { type Term as TermDocument } from "./Term"

export interface TaxonomyTerm extends Omit<IMxHierarchical, `parent`>, TermDocument {
  parent?: ObjectId
}

const Schema = defineDocumentSchema<TaxonomyTerm>({
}).mixin(Hierarchical<TaxonomyTerm>({ sort: `label` }))

export default defineDocumentModel<TermDocument, TaxonomyTerm>(`TaxonomyTerm`, Schema(), TermBase)
