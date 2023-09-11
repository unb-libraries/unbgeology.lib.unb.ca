import { model as defineModel, Schema, type SchemaDefinition } from "mongoose"
import { type Entity } from "../../types/entity"

export const defineEntityType = function<E extends Entity> (name: string, definition: SchemaDefinition<E>) {
  const schema = new Schema<E>({
    ...definition,
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  }, {
    timestamps: {
      createdAt: `created`,
      updatedAt: `updated`,
      currentTime: () => Date.now(),
    },
  })

  return defineModel<E>(name, schema)
}

export const defineNestedEntityType = function<E extends object> (definition: SchemaDefinition<E>) {
  return definition
}

export const defineEmbeddedEntityType = function<E extends object> (definition: SchemaDefinition<E>) {
  return new Schema<E>(definition)
}

export const defineWeakEntityType = function<E extends Entity> (definition: SchemaDefinition<E>) {
  return new Schema<E>({
    ...definition,
    created: Schema.Types.Number,
    updated: Schema.Types.Number,
  })
}
