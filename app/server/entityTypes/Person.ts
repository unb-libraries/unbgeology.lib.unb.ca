import { EntityFieldTypes } from "~/types/entity"

export interface IPerson {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default defineEmbeddedEntityType<IPerson>({
  firstName: {
    type: EntityFieldTypes.String,
    required: true,
  },
  lastName: {
    type: EntityFieldTypes.String,
    required: true,
  },
  email: {
    type: EntityFieldTypes.String,
    required: true,
  },
  phone: {
    type: EntityFieldTypes.String,
    required: false,
  },
})
