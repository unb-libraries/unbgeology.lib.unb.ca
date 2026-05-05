import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { Numeric, type QueryCondition } from "."
import { type DocumentBase } from "~/types/schema"
import type { FilterableQuery } from "~/types/entity"

export default function <D extends DocumentBase = DocumentBase> (field: string, condition: QueryCondition) {
  const [op, value] = condition
  if ((Array.isArray(value) && (value.length < 1 || value.every(s => isNaN(parseInt(s))))) || isNaN(parseInt(value as string))) {
    throw new Error(`Invalid value: must provide a number`)
  }

  if (op & FilterOperator.EQUALS | FilterOperator.GREATER | FilterOperator.LESS | FilterOperator.NOT) {
    return (query: FilterableQuery<D>) => {
      query.addVirtual(`${field}Size`, { $size: `$${field}` })
      Numeric(`${field}Size`, condition)(query)
    }
  }

  throw new Error(`Invalid operator`)
}
