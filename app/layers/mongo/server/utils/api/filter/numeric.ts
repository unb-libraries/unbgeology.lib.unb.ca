import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentQuery } from "../../../../types/entity"
import { type QueryCondition } from "."

const returnOnSomeSuccess = (fns: ((field: string, condition: QueryCondition) => (query: DocumentQuery) => void)[], field: string, condition: QueryCondition) => {
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

const Within = (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`Invalid value: must provide numeric range`)
  }

  const [min, max] = value.slice(-2).map(s => parseInt(s)).sort((a, b) => a - b)
  switch (op) {
    case FilterOperator.LESS | FilterOperator.GREATER:
    case FilterOperator.AND | FilterOperator.LESS | FilterOperator.GREATER: {
      return (query: DocumentQuery) => query.where(field).gt(min).and(field).lt(max)
    }
    case FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS:
    case FilterOperator.AND | FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS: {
      return (query: DocumentQuery) => query.where(field).gte(min).and(field).lte(max)
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Outside = (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`Invalid value: must provide numeric range`)
  }

  const [min, max] = value.slice(-2).map(s => parseInt(s)).sort((a, b) => a - b)
  switch (op) {
    case FilterOperator.OR | FilterOperator.LESS | FilterOperator.GREATER: {
      return (query: DocumentQuery) => query.expr({ $or: [{ [field]: { $lt: min } }, { [field]: { $gt: max } }] })
    }
    case FilterOperator.OR | FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS: {
      return (query: DocumentQuery) => query.expr({ $or: [{ [field]: { $lte: min } }, { [field]: { $gte: max } }] })
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Range = (field: string, condition: QueryCondition) => {
  try {
    return Within(field, condition)
  } catch (withinError) {
    try {
      return Outside(field, condition)
    } catch (outsideError) {
      throw new Error(([withinError, outsideError] as Error[]).map(err => err.message).join(`, `))
    }
  }
}

Range.Within = Within
Range.Outside = Outside

const Greater = (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : undefined : value ? parseInt(value) : undefined
  if (!number) {
    throw new Error(`Invalid value: must provide a number`)
  }

  switch (op) {
    case FilterOperator.GREATER: {
      return (query: DocumentQuery) => query.where(field).gt(number)
    }
    case FilterOperator.EQUALS | FilterOperator.GREATER: {
      return (query: DocumentQuery) => query.where(field).gte(number)
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Less = (field: string, condition: QueryCondition) => {
  const [op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : undefined : value ? parseInt(value) : undefined
  if (!number) {
    throw new Error(`Invalid value: must provide a number`)
  }

  switch (op) {
    case FilterOperator.LESS: {
      return (query: DocumentQuery) => query.where(field).lt(number)
    }
    case FilterOperator.EQUALS | FilterOperator.LESS: {
      return (query: DocumentQuery) => query.where(field).lte(number)
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Numeric = (field: string, condition: QueryCondition) => {
  return returnOnSomeSuccess([
    Range,
    Greater,
    Less,
  ], field, condition)
}

Numeric.Range = Range
Numeric.Greater = Greater
Numeric.Less = Less
Numeric.NoRange = (field: string, condition: QueryCondition) => {
  return returnOnSomeSuccess([
    Greater,
    Less,
  ], field, condition)
}

export default Numeric
