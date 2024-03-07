import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentQuery } from "../../../../types/entity"
import { type QueryCondition } from "."

export default function (field: string, condition: QueryCondition) {
  const [op, value] = condition
  if (!(op & (FilterOperator.EQUALS | FilterOperator.NOT | FilterOperator.MATCH))) {
    throw new Error(`Invalid operator`)
  }

  if (op & (FilterOperator.EQUALS | FilterOperator.NOT)) {
    return (query: DocumentQuery) => {
      if (op & FilterOperator.EQUALS & FilterOperator.NOT) {
        Array.isArray(value) ? query.where(field).nin(value) : query.where(field).ne(value)
      } else {
        Array.isArray(value) ? query.where(field).in(value) : query.where(field).eq(value)
      }
    }
  } else {
    return (query: DocumentQuery) => {
      const pattern = new RegExp(`${Array.isArray(value) ? value.at(-1) : value}`)
      query.where(field).match(pattern)
    }
  }
}
