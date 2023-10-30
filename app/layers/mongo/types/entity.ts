import {
  Schema,
  type SchemaOptions,
  type Model,
  type Types,
  type HydratedDocument,
  Query,
} from "mongoose"

export const EntityFieldTypes = Schema.Types

export interface Entity {
  readonly _id: Types.ObjectId
  slug?: string
  readonly created: Date
  readonly updated: Date
}

export interface EntityTypeOptions<E extends Entity = Entity> extends SchemaOptions<E> {
  slug?: string | string[] | (() => string)
}

export interface EntityInstanceMethods {
  pk(): string
  url(rel?: string): string
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
  findManybyURI(uris: string[]): Promise<HydratedDocument<E, I>>
}

export interface EntityJSONReference {
  self: string
}

export type EntityPropertyValue = string | number | EntityJSONReference | EntityPropertyValue[]

export type EntityJSON<E extends Entity = Entity> = {
  [Property in keyof E]: EntityPropertyValue
}

export interface EntityListOptions<E extends Entity = Entity> {
  total?: number
  transform?: (entity: EntityJSON<E>) => EntityJSON<E>
}

export interface QueryOptions {
  page: number
  pageSize: number
  select: string[]
  filterSelect: (options: { root?: string, prefix?: string, default?: string[] }) => string[],
  sort: string[]
}
