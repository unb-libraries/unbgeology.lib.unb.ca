import { type Entity } from "@unb-libraries/nuxt-layer-entity"
import { type Organization as OrganizationEntity, Status } from "types/affiliation"
import AffiliateBase, { type Affiliate } from "./Affiliate"
import { EntityFieldTypes } from "~/layers/mongo/types/entity"

interface Organization extends Omit<OrganizationEntity, keyof Entity>, Affiliate {}

function optionalOnImport(this: Affiliate) {
  return this.status as Status > Status.MIGRATED
}

export const Organization = defineDocumentModel(`Organization`, defineDocumentSchema<Organization>({
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
})(), AffiliateBase)
