import { type SchemaTypeOptions, Schema } from "mongoose"

const Types = Schema.Types

interface Entity {
  readonly _id: string
  readonly created: Date
  readonly updated: Date
}

type EntitySchema<E extends Entity> = {
  [Property in keyof E as Exclude<Property, keyof Entity>]: SchemaTypeOptions<Property>
}

export { Entity, EntitySchema, Types }
