import { type SchemaDefinition, type SchemaOptions } from "mongoose"
import { type Taxonomy } from "layers/base/types/entity"
import { type EntityDocument } from "layers/mongo/types/entity"

export const defineTaxonomyType = function<T extends EntityDocument<Taxonomy> = EntityDocument<Taxonomy>> (name: string, definition?: SchemaDefinition<T>, options?: SchemaOptions<T>) {
  // @ts-ignore
  return defineDocumentBundle<T, Taxonomy>(Taxonomy, name, definition, options)
}
