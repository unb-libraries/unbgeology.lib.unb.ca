import { type Image, type Entity, type User } from "@unb-libraries/nuxt-layer-entity"
import { type Person } from "types/affiliation"
import { type StorageLocation } from "types/vocabularies"
import { type Unit } from "types/vocabularies/geochronology"
import { type Classification as FossilClassification, type Portion as FossilPortion } from "types/vocabularies/fossil"
import { type Classification as MineralClassification, type Portion as MineralPortion } from "types/vocabularies/mineral"
import { type Classification as RockClassification, type Portion as RockPortion } from "types/vocabularies/rock"

export enum Category {
  FOSSIL = `fossil`,
  MINERAL = `mineral`,
  ROCK = `rock`,
}

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

export interface Specimen<C extends Category = Category.FOSSIL | Category.MINERAL | Category.ROCK> extends Entity {
  category: C
  objectID: {
    unb: string
    external?: string
    international?: string
    [id: string ]: string | undefined
  }
  slug: string
  description: string
  images: Image[]
  classification:
    C extends Category.FOSSIL ? FossilClassification :
      C extends Category.MINERAL ? MineralClassification :
        C extends Category.ROCK ? RockClassification :
          FossilClassification | MineralClassification | RockClassification
  measurements: Measurement[]
  date?: Date
  age: {
    relative: Unit
    numeric?: number
  }
  origin: Place
  pieces: number
  partial: boolean
  portion?:
    C extends Category.FOSSIL ? FossilPortion :
      C extends Category.MINERAL ? MineralPortion :
        C extends Category.ROCK ? RockPortion :
          FossilPortion | MineralPortion | RockPortion
  composition: Composition,
  collector?: Person,
  sponsor?: Person,
  loans?: Loan[],
  storage: Storage[],
  publications?: Publication[],
  status: Status
  editor: User
}
