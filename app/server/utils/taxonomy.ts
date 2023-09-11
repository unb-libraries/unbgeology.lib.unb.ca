import Taxonomy, { type Taxonomy } from "../entityTypes/Taxonomy"
import { Schema, type SchemaDefinition } from "mongoose"

export const defineTaxonomyType = function<T extends Taxonomy> (name: string, definition?: SchemaDefinition<T>) {
  const schema = new Schema(definition || {})
  return Taxonomy.discriminator<T>(name, schema, name.toLowerCase())
}
