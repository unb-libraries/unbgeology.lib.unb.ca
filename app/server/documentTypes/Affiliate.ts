import { type Entity, type Stateful } from "@unb-libraries/nuxt-layer-entity"
import { type Organization as OrganizationEntity, type Person as PersonEntity, Status, Pronouns, Title } from "types/affiliate"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import { type Term } from "~/layers/mongo/server/documentTypes/Term"
import ImageFile, { type Image } from "~/layers/mongo/server/documentTypes/Image"

type Affiliate<T> = Omit<T, keyof Entity> & Term & Stateful<typeof Status>
const MxStateful = Stateful({
  values: Status,
  default: Status.DRAFT,
})

const MxAuthorize = <T>(type: string) => Authorize<Affiliate<T>>({
  paths: (affiliate) => {
    const status = useEnum(Status).labelOf(affiliate.status).toLowerCase()
    return [
      `term`,
      `term:${status}`,
      `term:affiliate`,
      `term:affiliate:${status}`,
      `term:affiliate:${type}`,
      `term:affiliate:${type}:${status}`,
    ]
  },
})

export type Person = Affiliate<Omit<PersonEntity, `image`> & { image?: Image }>
export type Organization = Affiliate<OrganizationEntity>

function optionalOnImport(this: Affiliate<any>) {
  return this.status as Status > Status.MIGRATED
}

export default {
  Person: defineDocumentModel(`Person`, defineDocumentSchema<Person>({
    firstName: {
      type: EntityFieldTypes.String,
      required: true,
    },
    lastName: {
      type: EntityFieldTypes.String,
      required: true,
    },
    pronouns: {
      type: EntityFieldTypes.Mixed,
      enum: Pronouns,
      required: true,
    },
    title: {
      type: EntityFieldTypes.Mixed,
      enum: Title,
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
      ref: ImageFile.mongoose.model,
      required: false,
    },
    bio: {
      type: EntityFieldTypes.String,
      required: false,
    },
    email: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
      validate: {
        validator: function (email: string) {
          return /^.+@.+\..+$/.test(email)
        },
        message: `Invalid email address`,
      },
    },
    phone: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
      validate: {
        validator: function (phone: string) {
          return /^\+?[\d\s\-()]+$/.test(phone)
        },
        message: `Invalid phone number`,
      },
    },
    web: [{
      type: EntityFieldTypes.String,
      validate: {
        validator: function (url: string) {
          return /^(http|https):\/\/[^ "]+$/.test(url)
        },
        message: `Invalid web URL`,
      },
    }],
    active: {
      type: EntityFieldTypes.Boolean,
      required: false,
      default: true,
    },
  }).mixin(MxStateful)
    .mixin(MxAuthorize<Person>(`person`))(), Term),

  Organization: defineDocumentModel(`Organization`, defineDocumentSchema<Organization>({
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
      required: optionalOnImport,
    },
    contact: {
      type: {
        name: {
          type: EntityFieldTypes.String,
          required: true,
        },
        email: {
          type: EntityFieldTypes.String,
          required: true,
        },
        phone: {
          type: EntityFieldTypes.String,
          required: true,
        },
      },
      required: optionalOnImport,
    },
    web: [{
      type: EntityFieldTypes.String,
    }],
  }).mixin(MxStateful)
    .mixin(MxAuthorize<Organization>(`organization`))(), Term),
}
