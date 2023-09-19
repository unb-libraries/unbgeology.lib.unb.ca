import { Schema, type Model, type Types, type HydratedDocument } from "mongoose"

export const EntityFieldTypes = Schema.Types

export enum Cardinality {
  ONE_TO_ONE = 1,
  ONE_TO_MANY = 2,
  MANY_TO_ONE = 4,
  MANY_TO_MANY = 8,
  ANY = 15,
}

export interface EntityRelationship {
  cardinality: Cardinality
  path: string
  nested?: EntityRelationship[]
}

export interface EntityRelationshipsTraverseOptions {
  rootPath?: string
  filter?: {
    cardinality?: Cardinality,
    includeUnmatchedParent?: boolean,
  },
  flatten?: boolean,
}

export interface EntityTypeOptions {
  pk?: string
}

export interface Entity {
  readonly _id: Types.ObjectId
  readonly created: Date
  readonly updated: Date
}

export interface EntityInstanceMethods {
  pk(): string
  url(rel?: string): string
}

export interface EntityModel<E extends Entity = Entity, I extends EntityInstanceMethods = EntityInstanceMethods> extends Model<E, {}, I> {
  baseURL(): string
  findByPK(pk: string): Promise<HydratedDocument<E, I> | undefined>
  findByURL(url: string): Promise<HydratedDocument<E, I> | undefined>
  pk(): string
  relationships(options?: EntityRelationshipsTraverseOptions): EntityRelationship[]
}

export interface DiscriminatedEntity extends Entity {
  readonly __t: string
}
