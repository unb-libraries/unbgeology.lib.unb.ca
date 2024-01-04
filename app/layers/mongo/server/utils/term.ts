import { defu } from "defu"
import { type SchemaDefinition } from "mongoose"
import { type Term, type TaxonomyTerm } from "@unb-libraries/nuxt-layer-entity"
import { type EntityDocument, type TermListOptions, type TaxonomyOptions } from "../../types/entity"

export const defineTermList = function<T extends Term = Term> (name: string, definition?: SchemaDefinition<EntityDocument<T>>, options?: TermListOptions) {
  const { domain } = defu(options ?? {}, { domain: `default` })
  const bundleName = domain === `default` ? name : `${domain}.${name}`
  return defineDocumentBundle<EntityDocument<T>, EntityDocument<Term>>(Term, bundleName, definition)
}

export const defineTaxonomy = function<T extends TaxonomyTerm = TaxonomyTerm> (name: string, definition?: SchemaDefinition<EntityDocument<T>>, options?: TaxonomyOptions) {
  const { domain } = defu(options ?? {}, { domain: `default` })
  const bundleName = domain === `default` ? name : `${domain}.${name}`
  return defineDocumentBundle<EntityDocument<T>, EntityDocument<TaxonomyTerm>>(TaxonomyTerm, bundleName, definition)
}
