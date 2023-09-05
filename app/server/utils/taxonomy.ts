import Taxonomy, { type ITaxonomy } from "../entityTypes/Taxonomy"
import { Schema, type SchemaDefinition } from "mongoose"

export const defineTaxonomyType = function<T extends ITaxonomy> (name: string, definition?: SchemaDefinition<T>) {
  const schema = new Schema(definition || {})
  return Taxonomy.discriminator<T>(name, schema, name.toLowerCase())
}
