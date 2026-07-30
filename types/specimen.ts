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
import type { Composition } from "./composition"
import type { Loan } from "./loan"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  REVIEW = 4,
  PUBLISHED = 8,
}

export enum Legal {
  LOAN = 1,
  PERMANENT = 2,
}

export enum Category {
  FOSSIL = `fossil`,
  MINERAL = `mineral`,
  ROCK = `rock`,
}

export enum MeasurementCount {
  INDIVIDUAL = 1,
  AGGREGATE = 2,
  CONTAINER = 4,
  IMMEASURABLE = 8,
}

export enum Immeasurabibility {
  OTHER = 1,
  SIZE = 2,
  NUMBER = 4,
  CONDITION = 8,
}

export interface Place {
  latitude: number
  longitude: number
  accuracy: number
  name?: string
  description?: string
}

export interface Storage {
  id: string
  location: StorageLocation
  dateIn: string
}

export interface Publication {
  id: string
  citation: string
  abstract?: string
  doi?: string
}

export interface ObjectID {
  id: string
  type?: string
}

export interface Specimen extends Entity, Stateful<typeof Status> {
  type: Category
  pk: string
  mimsyID?: string
  objectIDs: ObjectID[]
  legal: Legal
  lenderID?: string
  lenderURL?: string
  slug: string
  collection: Collection
  name: string
  description: string
  images: EntityJSONList<Image>
  classification: Classification
  measurements: {
    count: MeasurementCount
    dimensions?: [number, number, number][]
    reason?: Immeasurabibility
  }
  date?: string
  age: {
    relative: Unit[]
    numeric?: number[]
  }
  origin: Place
  pieces: number
  partial: boolean
  collector?: Affiliate
  sponsor?: Affiliate
  appraisal?: number
  storage: Storage[]
  publications?: Publication[]
  creator: User
  editor: User
}

export interface Fossil extends Specimen {
  type: Category.FOSSIL
  classification: Fossil
  composition: EntityJSONList<Composition>
  portion: Term
}

export interface Mineral extends Specimen {
  type: Category.MINERAL
  classification: Mineral
}

export interface Rock extends Specimen {
  type: Category.ROCK
  classification: Rock
  composition: EntityJSONList<Composition>
}
