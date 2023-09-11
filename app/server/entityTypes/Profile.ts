import { type Organization } from "entity-types/Organization"
import { Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface Profile extends Entity {
  firstName: string
  lastName: string
  affiliations: [Organization]
  email: string
  phone: string
  public: boolean
}

export default defineEntityType<Profile>(`Profile`, {
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
    ref: `Organization`,
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
})
