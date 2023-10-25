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
  const { page, pageSize } = getQueryOptions(event)

  const { total } = options

  const nav: Navigator = {}
  if (total > page * pageSize) {
    nav.next = buildPageLink(path, { page: page + 1, pageSize })
    nav.last = buildPageLink(path, { page: Math.ceil(total / pageSize), pageSize })
  }

  if (page > 1) {
    nav.prev = buildPageLink(path, { page: page - 1, pageSize })
    nav.first = buildPageLink(path, { page: 1, pageSize })
  }

  return {
    page,
    pageSize,
    total,
    nav,
  }
}
