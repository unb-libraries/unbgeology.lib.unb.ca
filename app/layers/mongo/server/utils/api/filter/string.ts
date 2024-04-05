import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"

import { type QueryCondition } from "."
import type { DocumentBase } from "~/layers/mongo/types/schema"
import { type FilterableQuery } from "~/layers/mongo/types/entity"

export default function <D extends DocumentBase = DocumentBase> (field: string, condition: QueryCondition) {
  const [op, value] = condition
  if (!(op & (FilterOperator.EQUALS | FilterOperator.NOT | FilterOperator.MATCH))) {
    const accepted = [FilterOperator.EQUALS, FilterOperator.NOT, FilterOperator.MATCH].map(useEnum(FilterOperator).labelOf)
    throw new Error(`Invalid operator: ${op}; operator for "${field}" must be any of ${accepted.map(label => `"${label.toLowerCase()}"`).join(`, `)}`)
  }

  if (op & (FilterOperator.EQUALS | FilterOperator.NOT)) {
    return (query: FilterableQuery<D>) => {
      if (op & FilterOperator.EQUALS & FilterOperator.NOT) {
        Array.isArray(value) ? query.where(field).nin(value) : query.where(field).ne(value)
      } else {
        Array.isArray(value) ? query.where(field).in(value) : query.where(field).eq(value)
      }
    }
  } else {
    return (query: FilterableQuery<D>) => {
      const pattern = new RegExp(`${Array.isArray(value) ? value.at(-1) : value}`)
      query.where(field).match(pattern)
    }
  }
}
