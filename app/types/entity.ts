import { Schema, type Types } from "mongoose"

const EntityFieldTypes = Schema.Types

interface Entity {
  readonly _id: Types.ObjectId
  readonly created: Date
  readonly updated: Date
}

interface DiscriminatedEntity extends Entity {
  readonly __t: string
}

export { Entity, EntityFieldTypes, DiscriminatedEntity }