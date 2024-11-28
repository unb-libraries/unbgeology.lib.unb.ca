import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import type { H3Event } from "h3"
import type { Loan } from "~/types/loan"

type FilterParam = `${string}:${string}:${string}`
type Filter<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? Filter<T[K]> : T[K] extends Array<infer S>
      ? { count: [string, string] } & Filter<S> : [string, string]
}

interface EntityQuery<T extends Entity> {
  page?: number
  pageSize?: number
  select?: keyof T | (keyof T)[]
  filter?: FilterParam | FilterParam[]
  search?: string
}

const filterReducer = (acc: Filter<Loan>, [key, [op, value]]: [string, [string, string]]): Filter<Loan> => {
  const [first, ...rest] = key.split(`.`)
  if (rest.length) {
    return {
      ...acc,
      [first]: filterReducer((acc[first as keyof Filter<Loan>] || {}) as Filter<Loan>, [rest.join(`.`), [op, value]]),
    }
  }
  return {
    ...acc,
    [first]: [op, value],
  }
}

export function getLoanQueryParams(event: H3Event) {
  const { page, pageSize, select, filter, search } = getQuery<EntityQuery<Loan>>(event)
  const props = [`description`, `start`, `end`, `contact`, `specimens`, `contract`]
  return {
    page: page || 1,
    pageSize: pageSize || 25,
    select: (Array.isArray(select) ? select : select ? [select] : props)
      .filter(field => props.includes(`${field}`)),
    filter: (Array.isArray(filter) ? filter : filter ? [filter] : [])
      .map<[string, [string, string]]>((filter) => {
        const [field, op, value] = filter.split(`:`)
        return [field, [op, value]]
      })
      .filter(([field]) => props.find(prop => field.startsWith(prop)))
      .reduce(filterReducer, {} as Filter<Loan>),
    search,
  }
}
