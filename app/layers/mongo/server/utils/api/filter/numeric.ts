import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type FilterableQuery } from "../../../../types/entity"
import { type QueryCondition } from "."
import { type DocumentBase } from "~/layers/mongo/types/schema"

const returnOnSomeSuccess = <D extends DocumentBase = DocumentBase>(fns: ((field: string, condition: QueryCondition) => (query: FilterableQuery<D>) => void)[], field: string, condition: QueryCondition) => {
  const errors: Error[] = []
  for (const fn of fns) {
    try {
      return fn(field, condition)
    } catch (error) {
      errors.push(error as Error)
    }
  }
  throw new Error(errors.map(err => err.message).join(`, `))
}

const Within = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  const [op, value] = condition
  if (!Array.isArray(value) || value.length < 2 || value.some(v => isNaN(parseInt(v)))) {
    throw new Error(`Invalid value: must provide numeric range`)
  }

  const [min, max] = value.slice(-2).map(s => parseInt(s)).sort((a, b) => a - b)
  switch (op) {
    case FilterOperator.LESS | FilterOperator.GREATER:
    case FilterOperator.AND | FilterOperator.LESS | FilterOperator.GREATER: {
      return (query: FilterableQuery<D>) => query.where(field).gt(min).and(field).lt(max)
    }
    case FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS:
    case FilterOperator.AND | FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS: {
      return (query: FilterableQuery<D>) => query.where(field).gte(min).and(field).lte(max)
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Outside = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  const [op, value] = condition
  if (!Array.isArray(value) || value.length < 2 || value.some(v => isNaN(parseInt(v)))) {
    throw new Error(`Invalid value: must provide numeric range`)
  }

  const [min, max] = value.slice(-2).map(s => parseInt(s)).sort((a, b) => a - b)
  switch (op) {
    case FilterOperator.OR | FilterOperator.LESS | FilterOperator.GREATER: {
      return (query: FilterableQuery<D>) => query.expr({ $or: [{ [field]: { $lt: min } }, { [field]: { $gt: max } }] })
    }
    case FilterOperator.OR | FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS: {
      return (query: FilterableQuery<D>) => query.expr({ $or: [{ [field]: { $lte: min } }, { [field]: { $gte: max } }] })
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Range = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  try {
    return Within<D>(field, condition)
  } catch (withinError) {
    try {
      return Outside<D>(field, condition)
    } catch (outsideError) {
      throw new Error(([withinError, outsideError] as Error[]).map(err => err.message).join(`, `))
    }
  }
}

Range.Within = Within
Range.Outside = Outside

const Greater = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : NaN : parseInt(value)
  if (isNaN(number)) {
    throw new TypeError(`Invalid value: must provide a number`)
  }

  switch (op) {
    case FilterOperator.GREATER: {
      return (query: FilterableQuery<D>) => query.where(field).gt(number)
    }
    case FilterOperator.EQUALS | FilterOperator.GREATER: {
      return (query: FilterableQuery<D>) => query.where(field).gte(number)
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Less = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : NaN : parseInt(value)
  if (isNaN(number)) {
    throw new TypeError(`Invalid value: must provide a number`)
  }

  switch (op) {
    case FilterOperator.LESS: {
      return (query: FilterableQuery<D>) => query.where(field).lt(number)
    }
    case FilterOperator.EQUALS | FilterOperator.LESS: {
      return (query: FilterableQuery<D>) => query.where(field).lte(number)
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Equals = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : NaN : parseInt(value)
  if (isNaN(number)) {
    throw new TypeError(`Invalid value: must provide a number`)
  }

  if (op & (FilterOperator.EQUALS & FilterOperator.NOT)) {
    return (query: FilterableQuery<D>) => !Array.isArray(number)
      ? query.where(field).ne(number)
      : query.where(field).nin(number)
  } else if (op & FilterOperator.EQUALS) {
    return (query: FilterableQuery<D>) => !Array.isArray(number)
      ? query.where(field).eq(number)
      : query.where(field).in(number)
  }

  throw new Error(`Invalid operator`)
}

const Numeric = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  return returnOnSomeSuccess<D>([
    Range,
    Greater,
    Less,
    Equals,
  ], field, condition)
}

Numeric.Range = Range
Numeric.Greater = Greater
Numeric.Less = Less
Numeric.Equals = Equals
Numeric.NoRange = <D extends DocumentBase = DocumentBase>(field: string, condition: QueryCondition) => {
  return returnOnSomeSuccess<D>([
    Greater,
    Less,
  ], field, condition)
}

export default Numeric
