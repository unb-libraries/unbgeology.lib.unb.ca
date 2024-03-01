import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentQuery, type QueryOptions } from "~/layers/mongo/types/entity"

export default (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => {
  const [field, op, value] = condition

  if (op & FilterOperator.EQUALS & FilterOperator.NOT) {
    Array.isArray(value) ? query.where(field).nin(value) : query.where(field).ne(value)
  } else if (op & FilterOperator.EQUALS) {
    Array.isArray(value) ? query.where(field).in(value) : query.where(field).eq(value)
  }

  if (op & FilterOperator.MATCH) {
    const pattern = new RegExp(`${Array.isArray(value) ? value.at(-1) : value}`)
    query.where(field).match(pattern)
  }
}
