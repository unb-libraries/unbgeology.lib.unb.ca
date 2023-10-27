import { type Organization } from "entity-types/Organization"
import { type Profile } from "entity-types/Profile"
import { type Classification } from "taxonomies/Classification"
import { type StorageLocation } from "taxonomies/StorageLocation"
import { type User } from "entity-types/User"
import { Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

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

export enum Composition {
  SOLID = `solid`,
}

export enum LoanType {
  IN = `in`,
  OUT = `out`,
}

export interface Loan extends Entity {
  type: LoanType
  organization: Organization
  contact: Profile
  start: Date
  end: Date
  contract: string
}

export interface Storage extends Entity {
  location: StorageLocation
  dateIn: Date
  dateOut?: Date
}

export interface Publication extends Entity {
  citation: string
  abstract: string
  doi?: string
}

export interface Specimen extends Entity {
  objectId: string
  name: string
  slug: string
  description: string
  classifications: Classification[]
  dimensions: Dimension
  date?: Date
  age: string
  origin: Place
  pieces: number
  partial: boolean
  composition: Composition,
  collector?: Profile,
  sponsor?: Profile,
  loans?: Loan[],
  storage: Storage[],
  publications?: Publication[],
  status: Status
  editor: User
}

export type SpecimenDraft = Partial<Specimen> & { status: Status.DRAFT }
const optionalWhileInDraft = function (this: Specimen) {
  return this.status !== Status.DRAFT
}

export default defineEntityType<Specimen>(`Specimen`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  description: {
    type: EntityFieldTypes.String,
    required: optionalWhileInDraft,
  },
  classifications: {
    type: [{
      type: EntityFieldTypes.ObjectId,
      ref: `Taxonomy.Classification`,
      required: optionalWhileInDraft,
    }],
  },
  dimensions: {
    type: {
      width: {
        type: EntityFieldTypes.Number,
      },
      length: {
        type: EntityFieldTypes.Number,
      },
    },
    required: optionalWhileInDraft,
  },
  date: {
    type: EntityFieldTypes.Date,
    required: false,
  },
  age: {
    type: EntityFieldTypes.String,
    required: optionalWhileInDraft,
  },
  origin: {
    type: {
      latitude: {
        type: EntityFieldTypes.Number,
        required: true,
      },
      longitude: {
        type: EntityFieldTypes.Number,
        required: true,
      },
    },
    required: optionalWhileInDraft,
  },
  pieces: {
    type: EntityFieldTypes.Number,
    required: optionalWhileInDraft,
  },
  partial: {
    type: EntityFieldTypes.Boolean,
    required: optionalWhileInDraft,
  },
  composition: {
    type: EntityFieldTypes.String,
    enum: Composition,
    required: optionalWhileInDraft,
  },
  collector: {
    type: EntityFieldTypes.ObjectId,
    ref: `Profile`,
    required: false,
  },
  sponsor: {
    type: EntityFieldTypes.ObjectId,
    ref: `Profile`,
    required: false,
  },
  loans: {
    type: [defineEmbeddedEntityType<Loan>({
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
    })],
  },
  storage: {
    type: [defineEmbeddedEntityType<Storage>({
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
    })],
  },
  publications: {
    type: [defineEmbeddedEntityType<Publication>({
      citation: {
        type: EntityFieldTypes.String,
        required: true,
      },
      abstract: {
        type: EntityFieldTypes.String,
        required: true,
      },
      doi: {
        type: EntityFieldTypes.String,
        required: false,
      },
    })],
  },
  status: {
    type: EntityFieldTypes.String,
    required: true,
    enum: Status,
    default: Status.DRAFT,
  },
  editor: {
    type: EntityFieldTypes.ObjectId,
    ref: `User`,
    required: false,
  },
}, {
  slug: `name`,
})
