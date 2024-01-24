import { Status } from "@unb-libraries/nuxt-layer-entity"
import { type Affiliation as IAffiliation, type Organization as IOrganization, type Person as IPerson, Pronouns, Title } from "types/affiliation"
import { type EntityDocument, EntityFieldTypes } from "~/layers/mongo/types/entity"

type AffiliationDocument = EntityDocument<IAffiliation>
type OrganizationDocument = EntityDocument<IOrganization>
type PersonDocument = EntityDocument<IPerson>

function optionalOnImport(this: IAffiliation) {
  return this.status > Status.IMPORTED
}

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
    type: {
      line1: {
        type: EntityFieldTypes.String,
        required: true,
      },
      line2: {
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
    required: false,
  },
  contact: {
    name: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
    email: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
    phone: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
  },
  web: [{
    type: EntityFieldTypes.String,
  }],
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
    required: false,
  },
  occupation: {
    type: EntityFieldTypes.String,
    required: optionalOnImport,
  },
  position: {
    type: EntityFieldTypes.String,
    required: optionalOnImport,
  },
  image: {
    type: EntityFieldTypes.ObjectId,
    ref: ImageFile,
    required: false,
  },
  bio: {
    type: EntityFieldTypes.String,
    required: false,
  },
  contact: {
    email: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
    phone: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
  },
  web: [{
    type: EntityFieldTypes.String,
  }],
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
