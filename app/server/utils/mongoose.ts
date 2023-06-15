import { model as defineModel, Schema } from "mongoose"
import { type Entity, type EntitySchema } from "~~/types/entity"

export const defineEntityType = function<E extends Entity> (name: string, schema: EntitySchema<E>) {
  return defineModel<E>(name, new Schema<E>(schema, {
    timestamps: {
      createdAt: `created`,
      updatedAt: `updated`,
      currentTime: () => Math.floor(Date.now() / 1000),
    },
  }))
}
