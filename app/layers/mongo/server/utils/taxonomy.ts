import { type SchemaDefinition, type SchemaOptions } from "mongoose"
import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export const defineTaxonomyType = function<T extends Taxonomy = Taxonomy> (name: string, definition?: SchemaDefinition<T>, options?: SchemaOptions<T>) {
  // @ts-ignore
  return defineEntityBundle<T, Taxonomy>(Taxonomy, name, definition, options)
}
