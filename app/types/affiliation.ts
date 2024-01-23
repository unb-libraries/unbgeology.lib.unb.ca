import { type EntityBundle } from "@unb-libraries/nuxt-layer-entity"

export interface Affiliation extends EntityBundle {}

export interface Address {
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface Contact {
  email?: string
  phone?: string
  web?: string[]
}

export interface Organization extends Affiliation {
  name: string
  address: Address
export enum Pronouns {
  HE = 1,
  SHE = 2,
  THEY = 4,
}

export enum Title {
  NONE = 1,
  MR = 2,
  MS = 4,
  MRS = 8,
  DR = 16,
  PROF = 32,
}

export interface Person extends Affiliation {
  firstName: string
  lastName: string
  pronouns: Pronouns
  title?: Title
  occupation?: string
  position?: string
  contact: Contact
  bio?: string
  image?: Image
  active?: boolean
}
