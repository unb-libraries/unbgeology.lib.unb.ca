import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { Types } from "mongoose"
import { type DocumentQuery } from "../../../../types/entity"
import { type QueryCondition } from "."

export default function (field: string, condition: QueryCondition) {
  const [op, value] = condition

  const objectID = Array.isArray(value)
    ? value.map(v => new Types.ObjectId(v))
    : new Types.ObjectId(value)

  if (!(op & (FilterOperator.EQUALS | FilterOperator.NOT))) {
    throw new Error(`Invalid operator`)
  }

  return (query: DocumentQuery) => {
    if (op & FilterOperator.EQUALS & FilterOperator.NOT) {
      Array.isArray(objectID) ? query.where(field).nin(objectID) : query.where(field).ne(objectID)
    } else {
      Array.isArray(objectID) ? query.where(field).in(objectID) : query.where(field).eq(objectID)
    }
  }
}
