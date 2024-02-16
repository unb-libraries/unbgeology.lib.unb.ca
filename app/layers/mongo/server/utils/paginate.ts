import type { PaginateOptions, Navigator, PaginatorOptions } from "../../types/paginate"

const buildQuery = (...params: [string, string | number][]) => {
  return new URLSearchParams(params.map(([p, v]) => [p, `${v}`])).toString()
}

export const buildPageLink = function (path: string, params: PaginateOptions) {
  return `${path}?${buildQuery(...Object.entries(params))}`
}

export const usePaginator = function (options: PaginatorOptions & Partial<PaginateOptions>) {
  const event = useEvent()
  const { pathname: path } = getRequestURL(event)
  const queryOptions = getQueryOptions(event)

  const page = options?.page ?? queryOptions.page
  const pageSize = options?.pageSize ?? queryOptions.pageSize
  const total = options?.total

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
