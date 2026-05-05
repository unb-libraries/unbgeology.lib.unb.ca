import type { DocumentBase } from "../../../../types/schema"
import type { FilterableQuery } from "../../../../types/entity"
import Numeric from "./numeric"
import type { QueryCondition } from "."

enum Enum {}
const fn = <D extends DocumentBase = DocumentBase>(e: typeof Enum, fn: (field: string, condition: QueryCondition) => (query: FilterableQuery<D>) => void) => (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const map = (value: string) => useEnum(e).valueOf(value)
  return fn(field, [op, Array.isArray(value) ? value.map(map) : map(value)])
}

const EnumFilter = <D extends DocumentBase = DocumentBase>(e: typeof Enum) => (field: string, condition: QueryCondition) => fn<D>(e, Numeric)(field, condition)
const Greater = <D extends DocumentBase = DocumentBase>(e: typeof Enum) => (field: string, condition: QueryCondition) => fn<D>(e, Numeric.Greater)(field, condition)
const Less = <D extends DocumentBase = DocumentBase>(e: typeof Enum) => (field: string, condition: QueryCondition) => fn<D>(e, Numeric.Less)(field, condition)
const Equals = <D extends DocumentBase = DocumentBase>(e: typeof Enum) => (field: string, condition: QueryCondition) => fn<D>(e, Numeric.Equals)(field, condition)

EnumFilter.Greater = Greater
EnumFilter.Less = Less
EnumFilter.Equals = Equals

export default EnumFilter
