import { Schema, type Types } from "mongoose"

const EntityFieldTypes = Schema.Types

interface Entity {
  readonly _id: Types.ObjectId
  readonly created: Date
  readonly updated: Date
}

export { Entity, EntityFieldTypes }
