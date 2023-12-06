import { defu } from "defu"
import { type SchemaDefinition } from "mongoose"
import { type Term, type TaxonomyTerm } from "layers/base/types/entity"
import { type EntityDocument, type TermListOptions, type TaxonomyOptions } from "layers/mongo/types/entity"

export const defineTermList = function<T extends Term = Term> (name: string, definition?: SchemaDefinition<EntityDocument<T>>, options?: TermListOptions) {
  const { domain } = defu(options ?? {}, { domain: `default` })
  return defineDocumentBundle<EntityDocument<T>, EntityDocument<Term>>(Term, name, definition, {
    type: `${domain}.${name}`,
  })
}

export const defineTaxonomy = function<T extends TaxonomyTerm = TaxonomyTerm> (name: string, definition?: SchemaDefinition<EntityDocument<T>>, options?: TaxonomyOptions) {
  const { domain } = defu(options ?? {}, { domain: `default` })
  return defineDocumentBundle<EntityDocument<T>, EntityDocument<TaxonomyTerm>>(TaxonomyTerm, name, definition, {
    type: `${domain}.${name}`,
  })
}
