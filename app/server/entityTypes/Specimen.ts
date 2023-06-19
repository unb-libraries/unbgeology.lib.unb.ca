import { Entity, EntityFieldTypes } from "types/entity"
import { defineEntityType } from "~/server/utils/mongoose"

export enum Status {
  DRAFT = `draft`,
  REVIEW = `review`,
  PUBLISHED = `published`,
}

export interface Dimension {
  width: number
  height: number
}

export interface Specimen extends Entity {
  objectId: string
  name: string
  description?: string
  dimensions?: Dimension
  date?: Date
  age?: string
  pieces?: number
  partial?: boolean
  composition?: string
  status: Status
}

export default defineEntityType<Specimen>(`Specimen`, {
  objectId: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
  },
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  description: {
    type: EntityFieldTypes.String,
    required: false,
  },
  dimensions: {
    width: {
      type: EntityFieldTypes.Number,
      required: false,
    },
    length: {
      type: EntityFieldTypes.Number,
      required: false,
    },
  },
  date: {
    type: EntityFieldTypes.Date,
    required: false,
  },
  age: {
    type: EntityFieldTypes.String,
    required: false,
  },
  pieces: {
    type: EntityFieldTypes.Number,
    required: false,
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: false,
  },
  composition: {
    type: EntityFieldTypes.String,
    required: false,
  },
  status: {
    type: EntityFieldTypes.String,
    required: true,
    enum: Status,
    default: Status.DRAFT,
  },
})
