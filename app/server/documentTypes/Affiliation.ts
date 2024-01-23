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
  pronouns: {
    type: EntityFieldTypes.String,
    enum: Pronouns,
    required: true,
  },
  title: {
    type: EntityFieldTypes.String,
    enum: [Title.NONE, Title.MR, Title.MS, Title.MRS, Title.DR, Title.PROF, Title.PROF | Title.DR],
    required: true,
  },
  occupation: {
    type: EntityFieldTypes.String,
    required: false,
  },
  position: {
    type: EntityFieldTypes.String,
    required: false,
  },
  contact: {
    email: {
      type: EntityFieldTypes.String,
      required: false,
    },
    phone: {
      type: EntityFieldTypes.String,
      required: false,
    },
    web: [{
      type: EntityFieldTypes.String,
    }],
  },
  active: {
    type: EntityFieldTypes.Boolean,
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
