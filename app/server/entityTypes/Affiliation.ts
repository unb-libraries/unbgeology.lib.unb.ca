import { type Affiliation as IAffiliation, type Organization as IOrganization, type Person as IPerson } from "types/affiliation"
import { type EntityDocument, EntityFieldTypes } from "~/layers/mongo/types/entity"

type AffiliationDocument = EntityDocument<IAffiliation>
type OrganizationDocument = EntityDocument<IOrganization>
type PersonDocument = EntityDocument<IPerson>

export const Affiliation = defineDocumentType<AffiliationDocument>(`Affiliation`, {}, {
  virtuals: {
    uri: {
      get() {
        return `/api/affiliations/${this.type}/${this.pk}`
      },
    },
  },
})

export const Organization = defineDocumentBundle<AffiliationDocument, OrganizationDocument>(Affiliation, `Organization`, {
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

export const Person = defineDocumentBundle<AffiliationDocument, PersonDocument>(Affiliation, `Person`, {
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
