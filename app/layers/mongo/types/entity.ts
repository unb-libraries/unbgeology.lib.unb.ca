import { Schema, type Model, type Types, type HydratedDocument, Query } from "mongoose"
import { type H3Event } from "h3"
import { type PaginateOptions } from "~/layers/mongo/types/paginate"

export const EntityFieldTypes = Schema.Types

export enum Cardinality {
  ONE_TO_ONE = 1,
  ONE_TO_MANY = 2,
  MANY_TO_ONE = 4,
  MANY_TO_MANY = 8,
  ANY = 15,
}

export interface EntityTypeOptions {
  pk?: string
  slug?: string | string[] | (() => string)
}

export interface Entity {
  readonly _id: Types.ObjectId
  slug?: string
  readonly created: Date
  readonly updated: Date
}

export interface EntityRelationship {
  cardinality: Cardinality
  path: string
  targetModelName?: string
  nested?: EntityRelationship[]
}

export interface EntityRelationshipsTraverseOptions {
  rootPath?: string
  filter?: {
    cardinality?: Cardinality
    includeUnmatchedParent?: boolean
  },
  flatten?: boolean
  nested?: boolean
}

export interface EntityInstanceMethods {
  pk(): string
  url(rel?: string): string
}

export type PK = string | number | Types.ObjectId

export interface EntityQueryHelpers {
}

export interface EntityModel<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods, Q extends EntityQueryHelpers<E> = EntityQueryHelpers<E>> extends Model<E, I, Q> {
  baseURL(): string
  findByPK(pk: string): Query<HydratedDocument<E>, HydratedDocument<E>, EntityQueryHelpers>
  findByURL(url: string): Promise<HydratedDocument<E, I> | undefined>
  pk(): string
  getRelationship(path: string): EntityRelationship | undefined
  relationships(options?: EntityRelationshipsTraverseOptions): EntityRelationship[]
}

export interface DiscriminatedEntity extends Entity {
  readonly __t: string
}

export interface EntityHandlerOptions {
  discriminatorKey?: string
}

export interface EntityListHandlerOptions extends EntityHandlerOptions {
  paginate: boolean | Omit<PaginateOptions, `totalItems`>
}

export interface EntityDeleteHandlerOptions extends EntityHandlerOptions {
  findAndDelete?: (event: H3Event, model: EntityModel) => Promise<string[]>
}

export interface EntityRelationshipHandlerOptions extends EntityHandlerOptions {
  rel: string
}
