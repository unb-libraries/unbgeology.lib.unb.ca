import { type Address } from "entity-types/Address"
import { type Room } from "entity-types/Room"
import { Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface IBuilding extends Entity {
  name: string
  slug: string
  address: IAddress
  rooms: [IRoom]
}

export default defineEntityType<IBuilding>('Building', {
  name: {
    type: EntityFieldTypes.String,
    required: true,
  },
  slug: {
    type: EntityFieldTypes.String,
    required: true,
    unique: true,
    lowercase: true,
  },
  address: Address,
  rooms: [Room]
})