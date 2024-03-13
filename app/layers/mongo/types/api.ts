import type { Entity, EntityJSON } from "@unb-libraries/nuxt-layer-entity"
export enum Cardinality {
  ONE = 1,
  MANY = 2
}

export interface EntityBodyReaderOptions {
  cardinality: Cardinality
}

export interface FormatOptions<E extends Entity = Entity> {
  self: (entity: Omit<EntityJSON<E>, `self`>) => string
  removeEmpty: boolean
}

export interface FormatManyOptions<E extends Entity = Entity> {
  self: Partial<{
    list: string
    canonical: (entity: Omit<EntityJSON<E>, `self`>) => string
  }>
  removeEmpty: boolean
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
