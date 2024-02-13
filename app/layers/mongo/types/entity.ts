import { Schema, type SchemaOptions, type Model, type HydratedDocument, type UpdateQuery, type QueryOptions as MongooseQueryOptions, type QueryWithHelpers } from "mongoose"
import { FilterOperator, type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"

export const EntityFieldTypes = Schema.Types

export type EntityDocument<E extends Entity = Entity> = {
  slug?: string
  pk: PropertyKey
  uri: string
} & E

export interface DocumentTypeOptions<E extends Entity = Entity> extends SchemaOptions<E> {
  slug?: string | string[] | ((entity: E) => string)
}

export type DocumentBundleOptions<E extends EntityDocument = EntityDocument> = Pick<DocumentTypeOptions<E>, `toJSON` | `toObject` | `_id` | `id` | `virtuals` | `methods`> & {
  type?: string | ((name: string, parent: ReturnType<typeof defineDocumentType<E>>) => string)
}

export interface TermListOptions {
  domain?: string
}
export type TaxonomyOptions = TermListOptions

export interface EntityInstanceMethods {
  url(): string
}

export type EntityQueryFilter = Record<string, Record<FilterOperator, string[]>>
export interface EntityQueryHelpers {
  paginate(page: number, pageSize: number): EntityQueryHelpers
  search(search: string): EntityQueryHelpers
}

export interface EntityModel<
  E extends Entity = Entity,
  I extends EntityInstanceMethods = EntityInstanceMethods,
  Q extends EntityQueryHelpers = EntityQueryHelpers
> extends Model<E, I, Q>
{
  baseURL(): string
  findByPK(pk: string): QueryWithHelpers<HydratedDocument<E, I>, HydratedDocument<E, I>, Q, EntityDocument<E>, `findOne`>
  findByPKAndUpdate(pk: string, update: UpdateQuery<E>, options?: MongooseQueryOptions<E>): QueryWithHelpers<HydratedDocument<E, I>, HydratedDocument<E, I>, Q, EntityDocument<E>, `findOneAndUpdate`>
  findByPKAndDelete(pk: string, options?: MongooseQueryOptions<E>): QueryWithHelpers<HydratedDocument<E, I>, HydratedDocument<E, I>, Q, EntityDocument<E>, `findOneAndDelete`>
  findBySlug(slug: string): QueryWithHelpers<HydratedDocument<E, I>, HydratedDocument<E, I>, Q, EntityDocument<E>, `findOne`>
  findBySlugAndUpdate(slug: string, update: UpdateQuery<E>, options?: MongooseQueryOptions<E>): QueryWithHelpers<HydratedDocument<E, I>, HydratedDocument<E, I>, Q, EntityDocument<E>, `findOneAndUpdate`>
  findBySlugAndDelete(slug: string, options?: MongooseQueryOptions<E>): QueryWithHelpers<HydratedDocument<E, I>, HydratedDocument<E, I>, Q, EntityDocument<E>, `findOneAndDelete`>
  findByURI(uri: string): Promise<HydratedDocument<E, I> | null>
  findManyByURI(uris: string[]): Promise<HydratedDocument<E, I>[]>
}

export interface EntityListOptions<E extends Entity = Entity> {
  total?: number
  transform?: (entity: EntityJSON<E>) => EntityJSON<E>
}

export interface QueryOptions {
  page: number
  pageSize: number
  select: string[]
  filter: Record<string, Record<string, string[]>>
  filterSelect: (options?: { root?: string, prefix?: string, default?: string[] }) => string[],
  search: string
  sort: string[]
}

export interface DocumentQuery<E extends EntityDocument = EntityDocument> {
  query: () => { exec: () => Promise<[{ documents: E[], total: [{ total: number }]}]> }
  join: (field: string, model: ReturnType<typeof defineModel>) => DocumentQuery<E>
  and: DocumentQuery<E>[`where`]
  where: (field: string) => {
    eq: (value: string | number) => DocumentQuery<E>
    gt: (value: number) => DocumentQuery<E>
    lt: (value: number) => DocumentQuery<E>
  }
  select: (selection: any) => DocumentQuery<E>
  sort: (field: string, asc?: boolean) => DocumentQuery<E>
  paginate(page: number, pageSize: number): DocumentQuery<E>
  then: (resolve: (result: { documents: E[], total: number }) => void, reject: (err: any) => void) => void
}
export interface Join {
  from: string
  localField: string
  foreignField: string
  as: string
}
