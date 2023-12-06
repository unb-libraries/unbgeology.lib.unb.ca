import { type SchemaDefinition, type SchemaOptions } from "mongoose"
import { type Term, type TaxonomyTerm } from "layers/base/types/entity"
import { type EntityDocument } from "layers/mongo/types/entity"

export const defineTermList = function<T extends Term = Term> (name: string, definition?: SchemaDefinition<EntityDocument<T>>, options?: SchemaOptions<EntityDocument<T>>) {
  return defineDocumentBundle<EntityDocument<T>, EntityDocument<Term>>(Term, name, definition, options)
}

export const defineTaxonomy = function<T extends TaxonomyTerm = TaxonomyTerm> (name: string, definition?: SchemaDefinition<EntityDocument<T>>, options?: SchemaOptions<EntityDocument<T>>) {
  return defineDocumentBundle<EntityDocument<T>, EntityDocument<TaxonomyTerm>>(TaxonomyTerm, name, definition, options)
}
