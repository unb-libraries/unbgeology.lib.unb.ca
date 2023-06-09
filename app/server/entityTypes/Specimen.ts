import { defineEmbeddedEntityType, defineEntityType } from "layers/mongo/server/utils/mongoose"
import { Entity, EntityFieldTypes } from "types/entity"

export enum Status {
  DRAFT = `draft`,
  REVIEW = `review`,
  PUBLISHED = `published`,
}

export interface Dimension {
  width: number
  length: number
}

export interface Place {
  latitude: number
  longitude: number
  accuracy: number
  name?: string
  description?: string
}

export interface Specimen extends Entity {
  objectId: string
  name: string
  description?: string
  dimensions?: Dimension
  date?: Date
  age?: string
  origin?: Place
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
    type: defineEmbeddedEntityType<Dimension>({
      width: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      length: {
        type: EntityFieldTypes.Number,
        required: true,
      },
    }),
    required: false,
  },
  date: {
    type: EntityFieldTypes.Date,
    required: false,
  },
  age: {
    type: EntityFieldTypes.String,
    required: false,
  },
  origin: {
    type: defineEmbeddedEntityType<Place>({
      latitude: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      longitude: {
        type: EntityFieldTypes.Number,
        required: true,
      },
    }),
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
