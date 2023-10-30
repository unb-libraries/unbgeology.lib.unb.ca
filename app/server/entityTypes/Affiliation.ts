import { type Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export type Affiliation = Entity

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
  affiliations: [Organization]
  email: string
  phone: string
  public: boolean
}

export const Affiliation = defineEntityType<Affiliation>(`Affiliation`, {}, {
  virtuals: {
    uri: {
      get() {
        return `/api/affiliations/${this.type}/${this.pk}`
      },
    },
  },
})

export const Organization = defineEntityBundle<Affiliation, Organization>(Affiliation, `Organization`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  address: {
    address1: {
      type: EntityFieldTypes.String,
      required: true,
    },
    address2: {
      type: EntityFieldTypes.String,
      required: false,
    },
    city: {
      type: EntityFieldTypes.String,
      required: true,
    },
    state: {
      type: EntityFieldTypes.String,
      required: false,
    },
    postalCode: {
      type: EntityFieldTypes.String,
      required: true,
    },
    country: {
      type: EntityFieldTypes.String,
      required: true,
    },
  },
}, {
  virtuals: {
    uri: {
      get() {
        return `/api/affiliations/org/${this.pk}`
      },
    },
  },
})

export const Person = defineEntityBundle<Affiliation, Person>(Affiliation, `Person`, {
  firstName: {
    type: EntityFieldTypes.String,
    required: true,
  },
  lastName: {
    type: EntityFieldTypes.String,
    required: true,
  },
  affiliations: [{
    type: EntityFieldTypes.ObjectId,
    ref: `Affiliation.Organization`,
    required: false,
  }],
  email: {
    type: EntityFieldTypes.String,
    required: true,
  },
  phone: {
    type: EntityFieldTypes.String,
    required: false,
  },
  public: {
    type: EntityFieldTypes.Boolean,
    required: false,
    default: false,
  },
}, {
  virtuals: {
    uri: {
      get() {
        return `/api/affiliations/people/${this.id}`
      },
    },
  },
})
