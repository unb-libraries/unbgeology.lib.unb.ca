import { Schema, type SchemaOptions, type Model, type HydratedDocument, Query } from "mongoose"
import { type Entity, type EntityJSON } from "~/layers/base/types/entity"

export const EntityFieldTypes = Schema.Types

export type EntityDocument<E extends Entity = Entity> = {
  slug?: string
  pk: PropertyKey
  uri: string
} & E

export interface EntityTypeOptions<E extends Entity = Entity> extends SchemaOptions<E> {
  slug?: string | string[] | (() => string)
}

export interface EntityInstanceMethods {
  url(): string
}

export interface EntityQueryHelpers {
  paginate(page: number, pageSize: number): EntityQueryHelpers
}

export interface EntityModel<
  E extends Entity = Entity,
  I extends EntityInstanceMethods = EntityInstanceMethods,
  Q extends EntityQueryHelpers = EntityQueryHelpers
> extends Model<E, I, Q>
{
  baseURL(): string
  findByPK(pk: string): Query<HydratedDocument<E, I>, HydratedDocument<E, I>, EntityQueryHelpers>
  findByURI(uri: string): Promise<HydratedDocument<E, I> | null>
  findManyByURI(uris: string[]): Promise<HydratedDocument<E, I>>
}

export interface EntityListOptions<E extends Entity = Entity> {
  total?: number
  transform?: (entity: EntityJSON<E>) => EntityJSON<E>
}

export interface QueryOptions {
  page: number
  pageSize: number
  select: string[]
  filterSelect: (options?: { root?: string, prefix?: string, default?: string[] }) => string[],
  sort: string[]
}
