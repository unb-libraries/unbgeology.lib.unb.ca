import Numeric from "./numeric"
import { type QueryCondition } from "."
import type { DocumentQuery } from "~/layers/mongo/types/entity"

const toMsString = (value: QueryCondition[1]) => {
  try {
    const parse = (s: string) => Date.parse(s)
    return Array.isArray(value) ? value.map(parse).map(ms => `${ms}`) : `${parse(value)}`
  } catch (err) {
    throw new Error(`Invalid value: must provide a date string`)
  }
}

const fn = (fn: (field: string, condition: QueryCondition) => (query: DocumentQuery) => void) => (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const ms = toMsString(value)
  return fn(field, [op, ms])
}

const DateFilter = (field: string, condition: QueryCondition) => fn(Numeric)(field, condition)
const Range = (field: string, condition: QueryCondition) => fn(Numeric.Range)(field, condition)
const RangeWithin = (field: string, condition: QueryCondition) => fn(Numeric.Range.Within)(field, condition)
const RangeOutside = (field: string, condition: QueryCondition) => fn(Numeric.Range.Outside)(field, condition)
const Greater = (field: string, condition: QueryCondition) => fn(Numeric.Greater)(field, condition)
const Less = (field: string, condition: QueryCondition) => fn(Numeric.Less)(field, condition)
const NoRange = (field: string, condition: QueryCondition) => fn(Numeric.NoRange)(field, condition)

Range.Within = RangeWithin
Range.Outside = RangeOutside

DateFilter.Range = Range
DateFilter.Greater = Greater
DateFilter.Less = Less
DateFilter.NoRange = NoRange

export default DateFilter
