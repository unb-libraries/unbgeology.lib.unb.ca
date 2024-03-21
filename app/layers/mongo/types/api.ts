import type { Content, Entity } from "../types/entity"

export enum Cardinality {
  ONE = 1,
  MANY = 2
}

export interface EntityBodyReaderOptions {
  cardinality: Cardinality
}

export interface FormatOptions<T extends Content = Content> {
  self: (entity: Omit<Entity<T>, `self`>) => string
}

export interface FormatManyOptions<T extends Content = Content> {
  self: Partial<{
    list: string
    canonical: (entity: Omit<Entity<T>, `self`>) => string
  }>
  total: number
  page: number
  pageSize: number
}

export interface EntityHandlerOptions {
  page: number
  pageSize: number
  select: string[]
  sort: string[]
}
