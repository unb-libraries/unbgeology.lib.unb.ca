import { createDefu } from "defu"
import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import type { H3Event } from "h3"
import type { Loan } from "~/types/loan"

type Indexed<T> = { [K in keyof T]: T[K] }

interface Ops {
  ne: string | string[]
  eq: string | string[]
}
interface NumberOp extends Ops {
  gt: string
  gte: string
  lt: string
  lte: string
}

interface StringOp extends NumberOp {
  rx: string
}

type Exists<T, C> = C extends undefined ? T | boolean : T

type Op<T> = T extends number ? NumberOp : T extends string ? StringOp : Ops
type Filter<T extends Record<PropertyKey, unknown>> = {
  [K in keyof T]: T[K] extends Record<PropertyKey, unknown>
    ? Exists<Partial<Filter<T[K]>>, T[K]> : T[K] extends Array<infer S>
      ? (Indexed<S> extends Record<PropertyKey, unknown>
          ? Filter<S & { count: number }> : Exists<Partial<Op<T[K]>> & Filter<{ count?: number }>, T[K]>)
      : Exists<Partial<Op<T[K]>>, T[K]>
}

type FilterParam = `${`=` | `!` | `>` | `>=` | `<` | `<=` | `%`}${string}`

type EntityQuery<T extends Entity> = {
  page?: number
  pageSize?: number
  select?: keyof T | (keyof T)[]
  search?: string
  sort?: `-${string}` | string | (`-${string}` | string)[]
} & Record<string, FilterParam | FilterParam[]>

const defu = createDefu((obj, key, value) => {
  if (!obj[key] || typeof value !== `string`) {
    return false
  }

  if (Array.isArray(obj[key])) {
    obj[key].push(value)
  } else {
    // @ts-expect-error - if existing value is string, convert to array rather than override
    obj[key] = [obj[key], value]
  }
  return true
})

export function getLoanQueryParams(event: H3Event) {
  const { page, pageSize, select, search, sort, ...where } = getQuery<EntityQuery<Loan>>(event)
  const props = [`self`, `id`, `description`, `start`, `end`, `contact`, `contact.name`, `contact.affiliation`, `subjects`, `subjects.count`, `subjects.specimen.id`, `contract`, `contract.filename`, `contract.uri`, `type`]

  const opMap = { "=": `eq`, "!": `ne`, ">=": `gte`, ">": `gt`, "<=": `lte`, "<": `lt`, "%": `rx` }
  const pattern = new RegExp(`^(${Object.keys(opMap).join(`|`)})?(.*)$`)
  const match = (str: string) => {
    const matches = str.match(pattern)
    if (matches) {
      return { [opMap[matches[1] as keyof typeof opMap] ?? opMap[`=`]]: matches[2] }
    } else {
      return {}
    }
  }

  const parse = ([field, param]: [string, FilterParam | FilterParam[]]): Partial<Filter<Indexed<Loan>>> => {
    const [base, ...rest] = field.split(`.`)
    return rest.length
      ? { [base]: parse([rest.join(`.`), param]) }
      : { [base]: Array.isArray(param) ? param.map(match).reduce((merged, single) => defu(merged, single), {}) : match(param) }
  }

  return {
    page: page || 1,
    pageSize: pageSize || 25,
    search,
    select: (Array.isArray(select) ? select : select ? [select] : props)
      .filter(field => props.includes(`${field}`)),
    sort: (Array.isArray(sort) ? sort : sort ? [sort] : [])
      .filter(field => props.includes(field.replace(/^-/, ``)))
      .map(field => field.startsWith(`-`) ? [field.slice(1), -1] : [field, 1]) as [keyof Loan, 1 | -1][],
    where: Object.entries(where)
      .filter(([key]) => props.includes(key))
      .map(parse)
      .reduce((merged, single) => defu(merged, single), {}),
  }
}
