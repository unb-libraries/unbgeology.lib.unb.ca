export interface Navigator {
  next?: string
  prev?: string
  last?: string
  first?: string
}

export interface PaginateOptions {
  page?: number
  pageSize?: number
}

export interface PageableListHandlerOptions {
  paginate: false | PaginateOptions
}

export interface Paginator {
  page: number
  pageSize: number
  nav: Navigator
  totalItems: number
}

export interface PaginatorOptions {
  totalItems: number
  paginate?: PaginateOptions
}
