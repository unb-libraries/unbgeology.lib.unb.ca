import { type Image, type Stateful, type Term } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  PUBLISHED = 4,
}

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

export interface Affiliate extends Term, Stateful<typeof Status> {}

export interface Organization extends Affiliate {
  name: string
  address?: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  contact: {
    name: string
    email?: string
    phone?: string
  }
  web?: string[]
}

export interface Person extends Affiliate {
  pronouns: Pronouns
  image?: Image
  firstName: string
  lastName: string
  title?: Title
  occupation?: string
  position?: string
  bio?: string
  web?: string[]
  email?: string
  phone?: string
  active?: boolean
}
