import { Schema, type SchemaOptions, type Model, type HydratedDocument, type UpdateQuery, type QueryOptions as MongooseQueryOptions, type QueryWithHelpers } from "mongoose"
import { FilterOperator, type Entity, type EntityJSON } from "@unb-libraries/nuxt-layer-entity"
import type { DocumentBase, DocumentModel } from "./schema"
import { type Mutable } from "."

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
  filter: [string, FilterOperator, string | string[]][]
  filterSelect: (options?: { root?: string, prefix?: string, default?: string[] }) => string[],
  search: string
  sort: [string, boolean][]
}

export type DocumentUpdate<D extends DocumentBase = DocumentBase> = Pick<DocumentBase, `_id`> & Partial<Omit<D, `_id`>>
export type DocumentDiff<D extends DocumentBase = DocumentBase> = [DocumentUpdate<D>, DocumentUpdate<D>]
export interface DocumentQueryResult<D extends DocumentBase = DocumentBase> {
  documents: D[],
  update: (body: Partial<Mutable<D>>) => Promise<DocumentDiff<D>[]>
  delete: () => Promise<void>
  total: number
}

export interface DocumentQuery<D extends DocumentBase = DocumentBase> {
  query: () => { exec: () => Promise<[{ documents: D[], total: [{ total: number }]}]> }
  join: <J extends DocumentBase = DocumentBase>(field: string, model: DocumentModel<J>) => DocumentQuery<D>
  and: DocumentQuery<D>[`where`]
  where: {
    (field: string): {
      eq: (value: any) => DocumentQuery<D>
      ne: (value: any) => DocumentQuery<D>
      match: (pattern: RegExp) => DocumentQuery<D>
      in: (value: any[]) => DocumentQuery<D>
      nin: (value: any[]) => DocumentQuery<D>
      contains: (value: any) => DocumentQuery<D>
      gt: (value: number) => DocumentQuery<D>
      gte: (value: number) => DocumentQuery<D>
      lt: (value: number) => DocumentQuery<D>
      lte: (value: number) => DocumentQuery<D>
    },
    (...handlers: ((query: DocumentQuery<D>) => void)[]): DocumentQuery<D>
  }
  expr: (expr: object) => DocumentQuery<D>
  select: (...fields: string[]) => DocumentQuery<D>
  sort: (...fields: (string | [string, boolean])[]) => DocumentQuery<D>
  paginate(page: number, pageSize: number): DocumentQuery<D>
  then: (resolve: (result: DocumentQueryResult<D>) => void, reject: (err: any) => void) => void
}
export interface Join {
  from: string
  localField: string
  foreignField: string
  as: string
}
