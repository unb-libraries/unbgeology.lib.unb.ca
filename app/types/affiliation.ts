import { type Entity } from "layers/base/types/entity"

export interface Affiliation extends Entity {}

export interface Address {
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface Organization extends Affiliation {
  name: string
  address: Address
}

export interface Person extends Affiliation {
  firstName: string
  lastName: string
  affiliations?: Organization[]
  email: string
  phone: string
  public: boolean
}
