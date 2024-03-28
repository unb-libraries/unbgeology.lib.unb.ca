import { Schema, type SchemaOptions, type Model, type HydratedDocument, type UpdateQuery, type QueryOptions as MongooseQueryOptions, type QueryWithHelpers } from "mongoose"
import { FilterOperator, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import type { DocumentBase, DocumentModel } from "./schema"
import { type Mutable } from "."

export const EntityFieldTypes = Schema.Types

export interface Content {
  readonly created?: string
  readonly updated?: string
  readonly type?: string
}

export type Payload<C extends object = object> = C | Partial<Mutable<C>>

export type Diff<T extends Content = Content> = {
  previous: Partial<T>
} & Partial<T>

export type Entity<T extends Content = Content> = {
  readonly self: string
  readonly id: string
} & T

export type EntityDiff<T extends Content = Content> = Diff<Entity<T>>

export type EntityList<T extends Content = Content> = {
  self: string
  entities: Entity<T>[]
  nav: Partial<{
    first: string
    next: string
    prev: string
    last: string
  }>
  page: number
  pageSize: number
  total: number
}

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
  filter: [string, FilterOperator, string | string[]][]
  search: string
  sort: [string, boolean][]
}

export type DocumentUpdate<D extends DocumentBase = DocumentBase> = Pick<DocumentBase, `_id`> & Partial<Omit<D, `_id`>>
export type DocumentDiff<D extends DocumentBase = DocumentBase> = [DocumentUpdate<D>, DocumentUpdate<D>]

export type DocumentQueryResultItem<D = any> = {
  update: (body: Partial<Mutable<D>>) => Promise<[D, D]>
  delete: () => Promise<void>
} & D

export type DocumentQueryMethod = `findOne` | `findMany`
export type DocumentFindQueryResult<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> =
  M extends `findMany` ? {
    total: number
    documents: DocumentQueryResultItem<D>[],
  }
  : DocumentQueryResultItem<D> | undefined
export type DocumentUpdateQueryResult<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> =
  M extends `findMany` ? {
    documents: [D, D][]
    total: number
  }
  : [D, D] | undefined
export type DocumentDeleteQueryResult<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> =
  M extends `findMany` ? {
    documents: D[]
    total: number
  }
  : D | undefined

  interface DocumentQuery<Q, R> {
  join: <J extends DocumentBase = DocumentBase>(field: string, model: DocumentModel<J>) => Q
  and: DocumentQuery<Q, R>[`where`]
  where: (field: string) => {
    eq: (value: any) => Q
    ne: (value: any) => Q
    ex: () => Q
    match: (pattern: RegExp) => Q
    in: (value: any[]) => Q
    nin: (value: any[]) => Q
    contains: (value: any) => Q
    gt: (value: number) => Q
    gte: (value: number) => Q
    lt: (value: number) => Q
    lte: (value: number) => Q
  }
  expr: (expr: object) => Q
  select: (...fields: string[]) => Q
  sort: (...fields: (string | [string, boolean])[]) => Q
  paginate(page: number, pageSize: number): Q
  use: (...handlers: ((query: Q) => void)[]) => Q
  then: (resolve: (result: R) => void, reject: (err: any) => void) => void
}

export type DocumentFindQuery<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> = DocumentQuery<DocumentFindQuery<D, M>, DocumentFindQueryResult<D, M>>
export type DocumentUpdateQuery<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> = DocumentQuery<DocumentUpdateQuery<D, M>, DocumentUpdateQueryResult<D, M>>
export type DocumentDeleteQuery<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> = DocumentQuery<DocumentDeleteQuery<D, M>, DocumentDeleteQueryResult<D, M>>

export interface Join {
  from: string
  localField: string
  foreignField: string
  as: string
  cardinality?: `one` | `many`
}
