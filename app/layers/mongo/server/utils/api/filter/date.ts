import Numeric from "./numeric"
import { type DocumentQuery, type QueryOptions } from "~/layers/mongo/types/entity"

const toMsString = (value: QueryOptions[`filter`][number][2]) => {
  try {
    const parse = (s: string) => Date.parse(s)
    return Array.isArray(value) ? value.map(parse).map(ms => `${ms}`) : `${parse(value)}`
  } catch (err) {
    throw new Error(`Invalid value: must provide a date string`)
  }
}

const fn = (fn: (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => void) => (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => {
  const [field, op, value] = condition
  const ms = toMsString(value)
  return fn(query, [field, op, ms])
}

const DateFilter = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric)(query, condition)

const Range = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric.Range)(query, condition)
const RangeWithin = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric.Range.Within)(query, condition)
const RangeOutside = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric.Range.Outside)(query, condition)

const Greater = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric.Greater)(query, condition)
const Less = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric.Less)(query, condition)
const NoRange = (query: DocumentQuery, condition: QueryOptions[`filter`][number]) => fn(Numeric.NoRange)(query, condition)

Range.Within = RangeWithin
Range.Outside = RangeOutside

DateFilter.Range = Range
DateFilter.Greater = Greater
DateFilter.Less = Less
DateFilter.NoRange = NoRange

export default DateFilter
