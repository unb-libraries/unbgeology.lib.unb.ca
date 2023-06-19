import { type Entity } from "types/entity"
import { model as defineModel, Schema, type SchemaDefinition } from "mongoose"

export const defineEntityType = function<E extends Entity> (name: string, definition: SchemaDefinition<E>) {
  const schema = new Schema<E>(definition, {
    id: false,
    timestamps: {
      createdAt: `created`,
      updatedAt: `updated`,
      currentTime: () => Math.floor(Date.now() / 1000),
    },
  })

  return defineModel<E>(name, schema)
}
