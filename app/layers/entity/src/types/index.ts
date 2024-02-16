import { type AppConfigInput, type AppConfig } from "nuxt/schema"
import { type Ref, type ComputedRef } from "vue"

export enum Status {
  DRAFT = 1,
  IMPORTED = 2,
  PUBLISHED = 4,
}
export interface Entity {
  readonly self: string
  readonly id: string
  readonly created: string
  readonly updated: string
}

export interface EntityBundle extends Entity {
  type: string
}

export interface EntityType<E extends Entity = Entity> {
  name: string
  abstract?: boolean
  baseURI: string
  uri: (entity: E) => string,
  extends?: keyof AppConfigInput[`entityTypes`]
}

export type EntityJSON<E extends Entity = Entity> = Partial<Omit<E, `id` | `self`>> & Required<Pick<E, `id` | `self`>>
export type EntityJSONPropertyValue = string | number | boolean | EntityJSON

export type EntityJSONProperties<E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>> = Pick<EntityJSON<E>, P>

export interface EntityJSONList<E extends Entity = Entity> {
  entities: EntityJSON<E>[]
  nav: {
    first?: string
    last?: string
    next?: string
    prev?: string
  }
  page: number
  pageSize: number
  self: string
  total: number
}

export type EntityJSONBodyPropertyValue = Exclude<EntityJSONPropertyValue, EntityJSON>
export type EntityJSONBody<E extends object = object, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>> = {
  [K in P]:
    E[K] extends Entity[] ? string[] :
      E[K] extends Entity[] | undefined ? string[] | undefined :
        E[K] extends Entity ? string :
          E[K] extends Entity | undefined ? string | undefined :
            E[K] extends object ? EntityJSONBody<E[K]> :
              E[K] extends object | undefined ? EntityJSONBody<E[K]> | undefined :
                E[K]
}

export type EntityJSONCreateBody<E extends Entity = Entity> = Omit<EntityJSONBody<E>, `self`>
export type EntityJSONUpdateBody<E extends Entity = Entity> = EntityJSONBody<E> & { [K in `self`]-?: EntityJSONBody<E[K]> }

export interface EntityResponse<E extends Entity = Entity> {
  entity: Ref<EntityJSON<E> | null>
  errors: any[]
}

export interface EntityFetchResponse<E extends Entity = Entity> extends EntityResponse<E> {
  update: () => Promise<void>
  remove: () => Promise<void>
}

export type EntityCreateResponse<E extends Entity = Entity> = EntityFetchResponse<E>

export interface EntityDeleteResponse {
  success: boolean
  errors: any[]
}

// REFACTOR: Move to app/layers/base/types/index.d.ts
export enum FilterOperator {
  EQUALS = 1,
  MATCH = 2,
  GREATER = 4,
  LESS = 8,
  NOT = 16,
  AND = 32,
  OR = 64,
}
export type Filter = [string, FilterOperator, string] | [string, FilterOperator]
export interface Transformer<V = any> {
  input: (filterValue: string[]) => V
  output: (value: V) => (string[] | undefined)
  empty: (value: V) => boolean
}
export interface FilterGroup {
  has: (id: string, op?: FilterOperator, value?: string) => boolean
  get: (id: string, op?: FilterOperator) => Map<FilterOperator, Set<string>> | Set<string> | undefined
  set: (id: string, op: FilterOperator, value: Set<string>) => void
  add: (id: string, op?: FilterOperator, value?: string) => void
  remove: (id: string, op?: FilterOperator, value?: string) => void
  toArray: () => Filter[]
}

export interface FetchEntityListOptions {
  filter?: Filter[]
  page?: number
  pageSize?: number
  search?: string
  sort?: string[]
  select?: string[]
}

export interface EntityListResponse<E extends Entity = Entity> {
  list: Ref<EntityJSONList<E> | null>
  entities: ComputedRef<EntityJSONList<E>[`entities`]>
  query: {
    filter: Ref<Filter[]>
    page: Ref<number>
    pageSize: Ref<number>
    search: Ref<string>
    select: Ref<string[]>
    sort: Ref<string[]>
  }
  refresh: () => void
  add: (entity: EntityJSONCreateBody<E>) => Promise<EntityCreateResponse<E>>
  update: (entity: EntityJSONBody<E>) => Promise<EntityResponse<E>>
  remove: (entity: EntityJSON) => Promise<EntityDeleteResponse>
  errors: any[]
}

export interface User extends Entity {
  username: string
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}
export type JUser = EntityJSON<User>
export type JUserList = EntityJSONList<User>

export interface Term extends EntityBundle {
  label: string
}
export type JTerm = EntityJSON<Term>
export type JTermList = EntityJSONList<Term>

export interface TaxonomyTerm extends Term {
  parent?: TaxonomyTerm
}
export type JTaxonomy = EntityJSON<TaxonomyTerm>
export type JTaxonomyList = EntityJSONList<TaxonomyTerm>

export interface File extends EntityBundle {
  filename: string
  filepath: string
  filesize: number
  filetype: string
  persisted: boolean
  uploadName: string
}
export type JFile = EntityJSON<File>
export type JFileList = EntityJSONList<File>

export interface Image extends File {
  alt: string
  dimensions: {
    width: number
    height: number
  }
  title: string
}
export type JImage = EntityJSON<Image>
export type JImageList = EntityJSONList<Image>

export interface Document extends File {
}
export type JDocument = EntityJSON<Document>
export type JDocumentList = EntityJSONList<Document>

export enum MigrationStatus {
  INITIAL = 1,
  IDLE = 2,
  PENDING = 4,
  RUNNING = 8,
  IMPORTED = 16,
  ERRORED = 32,
  SKIPPED = 64,
  QUEUED = 128,
}

export interface Migration extends Entity {
  name: string
  entityType: keyof AppConfig[`entityTypes`]
  source: File[]
  dependencies: Migration[]
  total: number
  imported: number
  skipped: number
  errored: number
  status: MigrationStatus.IDLE | MigrationStatus.RUNNING
}
export type JMigration = EntityJSON<Migration>
export type JMigrationList = EntityJSONList<Migration>

export interface MigrationItem extends Entity {
  sourceID: number
  data: any[]
  entityURI?: string
  migration: Migration
  error?: string
  status: MigrationStatus.INITIAL | MigrationStatus.QUEUED | MigrationStatus.PENDING | MigrationStatus.IMPORTED | MigrationStatus.SKIPPED | MigrationStatus.ERRORED
}
