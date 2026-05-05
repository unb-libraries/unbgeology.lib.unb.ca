import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"

import { type QueryCondition } from "."
import type { DocumentBase } from "~/layers/mongo/types/schema"
import { type FilterableQuery } from "~/layers/mongo/types/entity"

export default function <D extends DocumentBase = DocumentBase> (field: string, condition: QueryCondition) {
  const [op, value] = condition
  if (op & (FilterOperator.EQUALS | FilterOperator.NOT)) {
    const accept = (str: string) => /^(t(rue)?|f(alse)?|[0-9]\d*)$/.test(str.toLowerCase())
    const toBoolean = (str: string) => /^(t(rue)?|[1-9]+)$/.test(str.toLowerCase())

    if ((Array.isArray(value) && !value.find(accept)) || (typeof value === `string` && !accept(value))) {
      throw new Error(`Invalid value: ${value}; value for "${field}" must be any of "true", "false", "0", or any positive integer.`)
    }

    const booleanValue = Array.isArray(value)
      ? toBoolean(value.filter(accept).at(-1)!)
      : toBoolean(value)

    return (query: FilterableQuery<D>) => {
      query.where(field).ex()
      if (op & FilterOperator.EQUALS & FilterOperator.NOT) {
        query.where(field).ne(booleanValue)
      } else {
        query.where(field).eq(booleanValue)
      }
    }
  }

  const accepted = [FilterOperator.EQUALS, FilterOperator.NOT].map(useEnum(FilterOperator).labelOf)
  throw new Error(`Invalid operator: ${op}; operator for "${field}" must be any of ${accepted.map(label => `"${label.toLowerCase()}"`).join(`, `)}`)
}
