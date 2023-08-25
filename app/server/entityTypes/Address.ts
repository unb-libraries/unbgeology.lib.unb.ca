import { EntityFieldTypes } from "~/types/entity"

export interface IAddress {
  type: `civic` | `po`
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export default defineEmbeddedEntityType<IAddress>({
  type: {
    type: EntityFieldTypes.String,
    required: true,
  },
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
})
