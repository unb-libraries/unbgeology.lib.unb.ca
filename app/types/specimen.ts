import type { Image, Entity, User, Term, Stateful, EntityJSONList } from "@unb-libraries/nuxt-layer-entity"
import type { Affiliate } from "types/affiliate"
import type { StorageLocation } from "types/storagelocation"
import type { Unit } from "types/geochronology"
import type {
  Classification,
  Fossil,
  Rock,
  Mineral,
} from "types/classification"
import type { Collection } from "./collection"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  REVIEW = 4,
  PUBLISHED = 8,
}

export enum Category {
  FOSSIL = `fossil`,
  MINERAL = `mineral`,
  ROCK = `rock`,
}

export enum MeasurementType {
  INDIVIDUAL = `individual`,
  SMALLEST = `smallest`,
  LARGEST = `largest`,
  AVERAGE = `average`,
  CONTAINER = `container`,
  IMMEASURABLE = `immeasurable`,
}

export enum Immeasurabibility {
  OTHER = `other`,
  TOO_SMALL = `too_small`,
  TOO_MANY = `too_many`,
  TOO_FRAGILE = `too_fragile`,
}

export interface Measurement {
  type: MeasurementType
  dimensions?: [number, number, number]
  reason?: Immeasurabibility
}

export interface Place {
  latitude: number
  longitude: number
  accuracy: number
  name?: string
  description?: string
}

export interface Loan {
  received: boolean
  contact: {
    name: string
    affiliation: string
    email: string
    phone: string
  }
  start: string
  end: string
  contract: string
}

export interface Storage {
  location: StorageLocation
  dateIn: string
  dateOut?: string
}

export interface Publication {
  id: string
  citation: string
  abstract?: string
  doi?: string
}

export interface Specimen extends Entity, Stateful<typeof Status> {
  type: Category
  pk: string
  objectIDs: {
    id: string
    type?: string
  }[]
  slug: string
  collection: Collection
  description: string
  images: EntityJSONList<Image>
  classification: Classification
  measurements: Measurement[]
  date?: string
  age: {
    relative: Unit
    numeric?: number
  }
  origin: Place
  pieces: number
  partial: boolean
  collector?: Affiliate,
  sponsor?: Affiliate,
  market?: number
  loans?: Loan[],
  storage: Storage[],
  publications?: Publication[],
  creator: User
  editor: User
}

export interface Fossil extends Specimen {
  type: Category.FOSSIL
  classification: Fossil
  portion: Term
}

export interface Mineral extends Specimen {
  type: Category.MINERAL
  classification: Mineral
}

export interface Rock extends Specimen {
  type: Category.ROCK
  classification: Rock
}
