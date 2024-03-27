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
export type DocumentQueryResult<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> =
  M extends `findMany` ? {
    total: number
    documents: DocumentQueryResultItem<D>[],
    update: (body: Partial<Mutable<D>>) => Promise<[D, D][]>
    delete: () => Promise<void>
  }
  : DocumentQueryResultItem<D>

export interface DocumentQuery<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> {
  join: <J extends DocumentBase = DocumentBase>(field: string, model: DocumentModel<J>) => DocumentQuery<D>
  and: DocumentQuery<D>[`where`]
  where: (field: string) => {
    eq: (value: any) => DocumentQuery<D>
    ne: (value: any) => DocumentQuery<D>
    ex: () => DocumentQuery<D>
    match: (pattern: RegExp) => DocumentQuery<D>
    in: (value: any[]) => DocumentQuery<D>
    nin: (value: any[]) => DocumentQuery<D>
    contains: (value: any) => DocumentQuery<D>
    gt: (value: number) => DocumentQuery<D>
    gte: (value: number) => DocumentQuery<D>
    lt: (value: number) => DocumentQuery<D>
    lte: (value: number) => DocumentQuery<D>
  }
  expr: (expr: object) => DocumentQuery<D>
  select: (...fields: string[]) => DocumentQuery<D>
  sort: (...fields: (string | [string, boolean])[]) => DocumentQuery<D>
  paginate(page: number, pageSize: number): DocumentQuery<D>
  use: (...handlers: ((query: DocumentQuery<D>) => void)[]) => DocumentQuery<D>
  then: (resolve: (result: DocumentQueryResult<D, M>) => void, reject: (err: any) => void) => void
}

export type DocumentUpdateQueryResult<D extends DocumentBase = DocumentBase, M extends `findOne` | `findMany` = `findMany`> =
  M extends `findMany` ? {
    documents: [D, D][]
    total: number
  }
  : [D, D]

export type DocumentUpdateQuery<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = `findMany`> = Omit<DocumentQuery<D, M>, `then`> & {
  then: (resolve: (result: DocumentUpdateQueryResult<D, M>) => void, reject: (err: any) => void) => void
}
export interface Join {
  from: string
  localField: string
  foreignField: string
  as: string
}
