import { defu } from "defu"
import { type H3Event } from "h3"
import { type EntityModel, type SelectRecord } from "~/layers/mongo/types/entity"
import { type PaginateOptions } from "~/layers/mongo/types/paginate"

const maxPageSize = 500

export const getPaginateOptions = async function (event: H3Event, model: EntityModel, defaults?: Partial<PaginateOptions>): Promise<PaginateOptions> {
  const { page, pageSize } = getQuery(event)
  const total = await model.count()

  const options = defu<PaginateOptions, Partial<PaginateOptions>[]>({ page, pageSize }, defaults ?? {}, {
    page: 1,
    pageSize: 25,
  })

  options.pageSize = Math.min(maxPageSize, Math.max(1, Number(options.pageSize)))
  options.page = Math.min(Math.ceil(total / options.pageSize), Math.max(1, Number(options.page)))

  return options
}

const asArray = (value: string | string[] | undefined) =>
  typeof value === `object` ? value : typeof value === `string` ? [value] : []

export const getSortOptions = function (event: H3Event) {
  const query = getQuery(event)
  const sort = asArray(query.sort?.toString())

  return sort
    .map(s => !s.startsWith(`-`) ? { [s]: `asc` } : { [s.substring(1)]: `desc` })
    .reduce((all, item) => ({ ...all, ...item }), {})
}

export const getSelectOptions = function (event: H3Event): SelectRecord<true> {
  const nest = function (path: string): SelectRecord<true> {
    const [base, ...sub] = path.split(`.`)
    const subPath = sub.join(`.`)
    return { [base]: subPath ? nest(subPath) : true }
  }

  const query = getQuery(event)
  const select = asArray(query.select?.toString())

  return defu({}, ...select.map(s => nest(s)))
}
