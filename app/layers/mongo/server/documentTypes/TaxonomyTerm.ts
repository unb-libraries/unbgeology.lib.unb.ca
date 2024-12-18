import { type ObjectId } from "mongoose"
import { Hierarchical, type Hierarchical as IMxHierarchical } from "../utils/mixins"
import TermBase, { type Term as TermDocument, renderTerm } from "./Term"

export interface TaxonomyTerm extends Omit<IMxHierarchical, `parent`>, TermDocument {
  parent?: ObjectId
}

const Schema = defineDocumentSchema<TaxonomyTerm>({
}, {
  alterSchema(schema) {
    schema.set(`toJSON`, {
      transform(doc, ret) {

        return {
          ...renderTerm(doc),
          parents: {
            self: `/api/terms/${doc._id}/parents`,
            ...ret.ancestors,
          },
        }
      },
    })
  },
}).mixin(Hierarchical<TaxonomyTerm>({ sort: `label` }))

export default defineDocumentModel<TermDocument, TaxonomyTerm>(`TaxonomyTerm`, Schema(), TermBase)
