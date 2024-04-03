import { type Entity } from "@unb-libraries/nuxt-layer-entity"
import { type Person as PersonEntity, Pronouns, Title, Status } from "types/affiliation"
import AffiliateBase, { type Affiliate } from "./Affiliate"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"
import Image from "~/layers/mongo/server/documentTypes/Image"

interface Person extends Omit<PersonEntity, keyof Entity>, Affiliate {

}

function optionalOnImport(this: Affiliate) {
  return this.status as Status > Status.MIGRATED
}

export const Person = defineDocumentModel(`Person`, defineDocumentSchema<Person>({
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
    ref: Image,
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
})(), AffiliateBase)
