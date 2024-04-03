import { type Entity } from "@unb-libraries/nuxt-layer-entity"
import { type Organization, type Person, Status, Pronouns, Title } from "types/affiliate"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import { type Term } from "~/layers/mongo/server/documentTypes/Term"
import Image from "~/layers/mongo/server/documentTypes/Image"

type Affiliate<T> = Omit<T, keyof Entity> & Term

function optionalOnImport(this: Affiliate<any>) {
  return this.status as Status > Status.MIGRATED
}

export default {
  Person: defineDocumentModel(`Person`, defineDocumentSchema<Affiliate<Person>>({
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
      default: Title.NONE,
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
      ref: Image.mongoose.model,
      required: false,
    },
    bio: {
      type: EntityFieldTypes.String,
      required: false,
    },
    email: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
    phone: {
      type: EntityFieldTypes.String,
      required: optionalOnImport,
    },
    web: [{
      type: EntityFieldTypes.String,
    }],
    active: {
      type: EntityFieldTypes.Boolean,
      required: false,
    },
  })(), Term),

  Organization: defineDocumentModel(`Organization`, defineDocumentSchema<Affiliate<Organization>>({
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
  })(), Term),
}
