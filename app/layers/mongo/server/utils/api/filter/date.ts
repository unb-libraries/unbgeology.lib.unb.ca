import Numeric from "./numeric"
import { type QueryCondition } from "."
import { type DocumentBase } from "~/layers/mongo/types/schema"
import { type FilterableQuery } from "~/layers/mongo/types/entity"

const toMsString = (value: QueryCondition[1]) => {
  try {
    const parse = (s: string) => Date.parse(s)
    return Array.isArray(value) ? value.map(parse).map(ms => `${ms}`) : `${parse(value)}`
  } catch (err) {
    throw new Error(`Invalid value: must provide a date string`)
  }
}

const fn = <D extends DocumentBase = DocumentBase>(fn: (field: string, condition: QueryCondition) => (query: FilterableQuery<D>) => void) => (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const ms = toMsString(value)
  return fn(field, [op, ms])
}

const DateFilter = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric)(field, condition)
const Range = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric.Range)(field, condition)
const RangeWithin = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric.Range.Within)(field, condition)
const RangeOutside = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric.Range.Outside)(field, condition)
const Greater = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric.Greater)(field, condition)
const Less = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric.Less)(field, condition)
const NoRange = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => fn<D>(Numeric.NoRange)(field, condition)

Range.Within = RangeWithin
Range.Outside = RangeOutside

DateFilter.Range = Range
DateFilter.Greater = Greater
DateFilter.Less = Less
DateFilter.NoRange = NoRange

export default DateFilter
