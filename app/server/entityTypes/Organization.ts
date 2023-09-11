import { type Address } from "entity-types/Address"
import { Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface Organization extends Entity {
  name: string
  address: Address
}

export default defineEntityType<Organization>(`Organization`, {
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  address: Address,
})
