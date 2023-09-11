import { type Entity, EntityFieldTypes } from "~/layers/mongo/types/entity"

export interface IRoom {
  number: string
  public: boolean
}

export default defineEmbeddedEntityType<IRoom>({
  number: {
    type: EntityFieldTypes.String,
    required: true,
  },
  public: {
    type: EntityFieldTypes.Boolean,
    required: false,
    default: false,
  }
})