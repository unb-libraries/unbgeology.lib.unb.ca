import { type H3Event } from "h3"
import { defu } from "defu"
import type { PaginateOptions, Navigator, PaginatorOptions } from "~/layers/mongo/types/paginate"

const defaultPaginateOptions: PaginateOptions = {
  pageSize: 25,
  page: 1,
}

export const getPaginateOptions = function (event: H3Event, defaultOptions: PaginateOptions) {
  return defu(getQuery(event), defaultOptions, defaultPaginateOptions)
}

const buildQuery = (...params: [string, string | number][]) => {
  return new URLSearchParams(params.map(([p, v]) => [p, `${v}`])).toString()
}

export const buildPageLink = function (path: string, params: PaginateOptions) {
  return `${path}?${buildQuery(...Object.entries(params))}`
}

export const usePaginator = function (event: H3Event, options: PaginatorOptions) {
  options.paginate = getPaginateOptions(event, options.paginate ?? {})
  const { pathname: path } = getRequestURL(event)

  const { totalItems } = options
  const pageSize = Math.min(options.paginate.pageSize || 1, options.totalItems)
  const page = Math.min(Math.max(1, options.paginate.page || 1), Math.ceil(options.totalItems / (options.paginate.pageSize || 1)))

  const nav: Navigator = {}
  if (totalItems > page * pageSize) {
    nav.next = buildPageLink(path, { page: page + 1, pageSize })
    nav.last = buildPageLink(path, { page: Math.ceil(totalItems / pageSize), pageSize })
  }

  if (page > 1) {
    nav.prev = buildPageLink(path, { page: page - 1, pageSize })
    nav.first = buildPageLink(path, { page: 1, pageSize })
  }

  return {
    page,
    pageSize,
    totalItems,
    nav,
  }
}
