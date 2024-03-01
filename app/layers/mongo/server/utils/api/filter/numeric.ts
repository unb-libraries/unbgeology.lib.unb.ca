import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type DocumentQuery, type EntityDocument, type QueryOptions } from "~/layers/mongo/types/entity"

type QueryCondition = QueryOptions[`filter`][number]

const returnOnSomeSuccess = (fns: ((query: DocumentQuery, condition: QueryCondition) => void)[], query: DocumentQuery, condition: QueryCondition) => {
  const errors: Error[] = []
  for (const fn of fns) {
    try {
      fn(query, condition)
      return
    } catch (error) {
      errors.push(error as Error)
    }
  }

  if (errors.length === fns.length) {
    throw new Error(errors.map(err => err.message).join(`, `))
  }
}

const Within = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  const [field, op, value] = condition
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`Invalid value: must provide numeric range`)
  }

  const [min, max] = value.slice(-2).map(s => parseInt(s)).sort((a, b) => a - b)
  switch (op) {
    case FilterOperator.LESS | FilterOperator.GREATER:
    case FilterOperator.AND | FilterOperator.LESS | FilterOperator.GREATER: {
      query.where(field).gt(min).and(field).lt(max)
      break
    }
    case FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS:
    case FilterOperator.AND | FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS: {
      query.where(field).gte(min).and(field).lte(max)
      break
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Outside = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  const [field, op, value] = condition
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`Invalid value: must provide numeric range`)
  }

  const [min, max] = value.slice(-2).map(s => parseInt(s)).sort((a, b) => a - b)
  switch (op) {
    case FilterOperator.OR | FilterOperator.LESS | FilterOperator.GREATER: {
      query.expr({ $or: [{ [field]: { $lt: min } }, { [field]: { $gt: max } }] })
      break
    }
    case FilterOperator.OR | FilterOperator.LESS | FilterOperator.GREATER | FilterOperator.EQUALS: {
      query.expr({ $or: [{ [field]: { $lte: min } }, { [field]: { $gte: max } }] })
      break
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Range = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  try {
    Within(query, condition)
  } catch (withinError) {
    try {
      Outside(query, condition)
    } catch (outsideError) {
      throw new Error(([withinError, outsideError] as Error[]).map(err => err.message).join(`, `))
    }
  }
}

Range.Within = Within
Range.Outside = Outside

const Greater = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  const [field, op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : undefined : value ? parseInt(value) : undefined
  if (!number) {
    throw new Error(`Invalid value: must provide a number`)
  }

  switch (op) {
    case FilterOperator.GREATER: {
      query.where(field).gt(number)
      break
    }
    case FilterOperator.AND | FilterOperator.GREATER: {
      query.where(field).gte(number)
      break
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Less = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  const [field, op, value] = condition
  const number = Array.isArray(value) ? value.length > 0 ? parseInt(value.at(-1)!) : undefined : value ? parseInt(value) : undefined
  if (!number) {
    throw new Error(`Invalid value: must provide a number`)
  }

  switch (op) {
    case FilterOperator.LESS: {
      query.where(field).lt(number)
      break
    }
    case FilterOperator.AND | FilterOperator.LESS: {
      query.where(field).lte(number)
      break
    }
    default: throw new Error(`Invalid operator`)
  }
}

const Numeric = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  returnOnSomeSuccess([Range, Greater, Less], query, condition)
}

Numeric.Range = Range
Numeric.Greater = Greater
Numeric.Less = Less
Numeric.NoRange = <E extends EntityDocument = EntityDocument> (query: DocumentQuery<E>, condition: QueryOptions[`filter`][number]) => {
  returnOnSomeSuccess([Greater, Less], query, condition)
}

export default Numeric
