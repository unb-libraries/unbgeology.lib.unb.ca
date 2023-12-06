import { type Image, type Entity, type User } from "layers/base/types/entity"
import { type Person } from "types/affiliation"
import { GeochronologicUnit, type Classification, type StorageLocation } from "types/vocabularies"

export enum Status {
  DRAFT = `draft`,
  REVIEW = `review`,
  PUBLISHED = `published`,
}

export interface Measurement {
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
  contact: {
    name: string
    affiliation: string
    email: string
    phone: string
  }
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
  abstract?: string
  doi?: string
}

export interface Specimen extends Entity {
  objectID: {
    unb: string
    external?: string
    international?: string
    [id: string ]: string | undefined
  }
  slug: string
  name: string
  description: string
  images: Image[]
  classifications: Classification[]
  measurements: Measurement[]
  date?: Date
  age: {
    relative: GeochronologicUnit
    numeric: number
  }
  origin: Place
  pieces: number
  partial: boolean
  composition: Composition,
  collector?: Person,
  sponsor?: Person,
  loans?: Loan[],
  storage: Storage[],
  publications?: Publication[],
  status: Status
  editor: User
}
