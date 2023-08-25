import { Entity, EntityFieldTypes } from "~/types/entity"
import Address, { type IAddress} from "./Address"
import Room, { type IRoom } from "./Room"

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