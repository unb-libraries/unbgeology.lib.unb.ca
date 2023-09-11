import { Schema, type SchemaDefinition } from "mongoose"
import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export const defineTaxonomyType = function<T extends Taxonomy> (name: string, definition?: SchemaDefinition<T>) {
  const schema = new Schema(definition || {})
  return Taxonomy.discriminator<T>(name, schema, name.toLowerCase())
}
