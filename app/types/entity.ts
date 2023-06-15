import { type SchemaTypeOptions, Schema, type Types } from "mongoose"

const EntityFieldTypes = Schema.Types

interface Entity {
  readonly _id: Types.ObjectId
  readonly created: Date
  readonly updated: Date
}

type EntitySchema<E extends Entity> = {
  [Property in keyof E as Exclude<Property, keyof Entity>]: SchemaTypeOptions<Property>
}

export { Entity, EntitySchema, EntityFieldTypes }
