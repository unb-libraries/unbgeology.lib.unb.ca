import { defineEmbeddedEntityType, defineEntityType } from "layers/mongo/server/utils/mongoose"
import { Entity, EntityFieldTypes } from "types/entity"
import { type Organization } from "entity-types/Organization"
import { type StorageLocation } from "taxonomies/StorageLocation"
import { type Classification } from "taxonomies/Classification"

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

export enum LoanType {
  IN = `in`,
  OUT = `out`,
}

export interface Loan {
  type: LoanType
  organization: Organization
  contact: Profile
  start: Date
  end: Date
  contract: string
}

export interface Storage {
  location: StorageLocation
  dateIn: Date
  dateOut?: Date
}

export interface Specimen extends Entity {
  objectId: string
  name: string
  description?: string
  classification: Classification
  dimensions?: Dimension
  date?: Date
  age?: string
  origin?: Place
  pieces?: number
  partial?: boolean
  loans?: [Loan],
  storage: Storage[],
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
  classification: {
    type: EntityFieldTypes.ObjectId,
    ref: `Classification`,
    required: true,
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
  loans: [{
    type: {
      type: EntityFieldTypes.String,
      enum: LoanType,
      required: true,
    },
    organization: {
      type: EntityFieldTypes.ObjectId,
      ref: `Organization`,
      required: true,
    },
    contact: {
      type: EntityFieldTypes.ObjectId,
      ref: `Profile`,
      required: true,
    },
    start: {
      type: EntityFieldTypes.Date,
      required: true,
    },
    end: {
      type: EntityFieldTypes.Date,
      required: true,
    },
  }],
  storage: [{
    location: {
      type: EntityFieldTypes.ObjectId,
      ref: `StorageLocation`,
      required: true,
    },
    dateIn: {
      type: EntityFieldTypes.Date,
      required: true,
    },
    dateOut: {
      type: EntityFieldTypes.Date,
      required: false,
    },
  }],
  status: {
    type: EntityFieldTypes.String,
    required: true,
    enum: Status,
    default: Status.DRAFT,
  },
})
