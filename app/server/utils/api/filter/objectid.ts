import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { Types } from "mongoose"
import { type QueryCondition } from "."
import { type FilterableQuery } from "~/layers/mongo/types/entity"
import type { DocumentBase } from "~/layers/mongo/types/schema"

export default function <D extends DocumentBase = DocumentBase> (field: string, condition: QueryCondition): (query: FilterableQuery<D>) => void {
  const [op, value] = condition

  const objectID = Array.isArray(value)
    ? value.map(v => new Types.ObjectId(v))
    : new Types.ObjectId(value)

  if (!(op & (FilterOperator.EQUALS | FilterOperator.NOT))) {
    throw new Error(`Invalid operator`)
  }

  return (query: FilterableQuery<D>) => {
    if (op & FilterOperator.EQUALS & FilterOperator.NOT) {
      Array.isArray(objectID) ? query.where(field).nin(objectID) : query.where(field).ne(objectID)
    } else {
      Array.isArray(objectID) ? query.where(field).in(objectID) : query.where(field).eq(objectID)
    }
  }
}
