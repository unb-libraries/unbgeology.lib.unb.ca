import { Schema, type Types } from "mongoose"

export const EntityFieldTypes = Schema.Types

export interface Entity {
  readonly _id: Types.ObjectId
  readonly created: Date
  readonly updated: Date
}

export interface DiscriminatedEntity extends Entity {
  readonly __t: string
}
