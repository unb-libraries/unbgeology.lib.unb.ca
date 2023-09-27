import { type H3Event } from "h3"
import type { PaginateOptions, Navigator, PaginatorOptions } from "~/layers/mongo/types/paginate"

const buildQuery = (...params: [string, string | number][]) => {
  return new URLSearchParams(params.map(([p, v]) => [p, `${v}`])).toString()
}

export const buildPageLink = function (path: string, params: PaginateOptions) {
  return `${path}?${buildQuery(...Object.entries(params))}`
}

export const usePaginator = function (event: H3Event, options: PaginatorOptions) {
  const { pathname: path } = getRequestURL(event)

  const { totalItems } = options
  const pageSize = Math.min(options.pageSize || 1, options.totalItems)
  const page = Math.min(Math.max(1, options.page || 1), Math.ceil(options.totalItems / (options.pageSize || 1)))

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
