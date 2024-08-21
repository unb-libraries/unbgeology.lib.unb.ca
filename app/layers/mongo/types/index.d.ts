import { H3Event, HTTPMethod } from "h3"
import { type MigrationItem, type MigrationItem } from "../server/documentTypes/MigrationItem"
import type { Entity, EntityJSON, EntityJSONBody, Migration, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import type { DocumentFindQuery, DocumentBaseQuery, DocumentQueryMethod, EntityDocument, DocumentQuery } from "./entity"
import type { SourceItem } from "./migrate"
import type Mongoose, { type Document } from "mongoose"
import type { DocumentBase, DocumentModel } from "./schema"
import type { EntityBodyReaderOptions } from "./api"
import type { Document } from "@unb-libraries/nuxt-layer-entity"

type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B

type MutableKeys<T> = {
  [P in keyof T]: IfEquals<
  { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
    >
  }[keyof T]

type MutablePart<T> = Pick<T, MutableKeys<T>>

export type Mutable<T = any> = MutablePart<T>

export enum Read {
  CREATE = 1,
  UPDATE = 2,
}

export declare module "nuxt/schema" {
  interface RuntimeConfig {
    nitro: {
      mongodb: {
        uri: string
        host: string
        port: number
        db: string
        user: string
        pass: string
        authSource: string
      }
      defaultSchemaVersion: Record<string, number>
    },
  }
}

export type MigrateHandler = (data: any, migration: Migration, emits: {
  ready: <E extends Entity = Entity>(item: EntityJSONBody<E>) => void | Promise<void>
  error: (errorMessage: string) => void | Promise<void>
  skip: () => void | Promise<void>
}) => void | Promise<void>

export interface MigrateOptions {
  limit?: number
  chunkSize?: number
}

export interface PluginOptions<F extends function = any> {
  enable: (...params: Parameters<F>) => boolean
  strict: boolean
}

export interface RenderOptions<T extends object = object> {
  type?: string
  fields?: string[]
  self: (data: T) => string
}
export interface RenderListOptions<T extends object = object, O extends RenderOptions = RenderOptions<T>> {
  canonical: O
  self: (data: T[]) => string
  total: number
  page: number
  pageSize: number
}
export interface RenderDocumentOptions<D extends DocumentBase = DocumentBase> extends RenderOptions<D> {
  model?: DocumentModel<D>
}

export type RenderDocumentListOptions<D extends DocumentBase = DocumentBase> = Omit<RenderDocumentOptions<D>, `fields`> & RenderListOptions<D, Partial<RenderDocumentOptions<D>>>

export interface PayloadReadOptions<P extends `create` | `update` = `create` | `update`> {
  event: H3Event
  type?: string
  fields?: string[]
  flat: boolean
  flattenArrays: boolean
  flattenExcept: string[]
  op: P
}

export interface DocumentPayloadReadOptions<D extends DocumentBase = DocumentBase, P extends `create` | `update` = `create` | `update`> extends PayloadReadOptions<P> {
  model: DocumentModel<D>
}

export interface MigrateItemHookOptions {
  fetch: <E extends Entity = Entity>(uri: string, options?: Partial<{ method: HTTPMethod, body: any }>) => Promise<EntityJSON<E>>
  fields?: string[]
}


export declare module "nitropack" {
  interface NitroRuntimeHooks {
    "mongoose:init": (mongoose: typeof Mongoose) => void | Promise<void>
    "mongoose:schema:update": <T extends DocumentBase = DocumentBase>(Model: DocumentModel<T>[`mongoose`][`model`]) => void | Promise<void>
    "mongoose:query:event": <D, M>(query: DocumentQuery<D, M>, context: { event: H3Event }) => void | Promise<void>
    
    // migrate hooks
    migrate: (migrationID: string) => void | Promise<void>
    // REFACTOR: All migrate hooks shall use EntityJSON<MigrationItem>
    "migrate:import:item": (item: Document<any, {}, MigrationItem> & MigrationItem, options: MigrateItemHookOptions) => void | Promise<void>
    "migrate:import:item:update": (item: Document<any, {}, MigrationItem> & MigrationItem, options: MigrateItemHookOptions) => void | Promise<void>
    "migrate:import:item:pending": (item: Document<any, {}, MigrationItem> & MigrationItem, options: MigrateItemHookOptions) => void | Promise<void>
    "migrate:import:item:transform": (item: Document<any, {}, MigrationItem> & MigrationItem, options: MigrateItemHookOptions) => any | Promise<any>
    // "migrate:import:item:done": (item: Document<any, {}, MigrationItem> & MigrationItem) => void | Promise<void>
    
    "migrate:rollback:item": (item: Document<any, {}, MigrationItem> & MigrationItem, options: MigrateItemHookOptions) => void | Promise<void>
    "migrate:rollback:item:error": (item: Document<any, {}, MigrationItem> & MigrationItem, error: Error | string) => void | Promise<void>
    "migrate:rollback:item:done": (item: Document<any, {}, MigrationItem> & MigrationItem, options: MigrateItemHookOptions) => void | Promise<void>

    "migrate:queue": (queue: string) => void | Promise<void>
    "migrate:queue:done": (queue: string) => void | Promise<void>

    "migrate:init": (migration: Migration | string, items: SourceItem[]) => void | Promise<void>
    "migrate:import:start": (migration: EntityJSON<Migration>, options?: Partial<MigrateOptions>) => void | Promise<void>
    "migrate:import:done": (migration: EntityJSON<Migration>, options?: Partial<MigrateOptions>) => void | Promise<void>
    // "migrate:import:item": (item: Document<any, {}, MigrationItem> & MigrationItem) => any | Promise<any>
    // "migrate:import:item:queued": (item: Document<any, {}, MigrationItem> & MigrationItem) => void | Promise<void>
    "migrate:import:item:done": (item: Document<any, {}, MigrationItem> & MigrationItem, entity?: EntityJSON<E>, error?: string) => void | Promise<void>
    "migrate:import:item:imported": <E extends Entity = Entity>(item: Document<any, {}, MigrationItem> & MigrationItem) => void | Promise<void>
    "migrate:import:item:updated": <E extends Entity = Entity>(item: Document<any, {}, MigrationItem> & MigrationItem) => void | Promise<void>
    "migrate:import:item:error": (item: Document<any, {}, MigrationItem> & MigrationItem, error: Error | string) => void | Promise<void>
    "migrate:import:item:skipped": (item: Document<any, {}, MigrationItem> & MigrationItem) => void | Promise<void>
    "migrate:import:item:wait": (item: Document<any, {}, MigrationItem> & MigrationItem) => void | Promise<void>
    "migrate:rollback:start": (migration: EntityJSON<Migration>) => void | Promise<void>
    "migrate:rollback:done": (migration: EntityJSON<Migration>) => void | Promise<void>
    "migrate:pause": (migration: Migration) => void | Promise<void>
    
    // Entity hooks
    "entity:render": (item: any, options: RenderOptions<any>) => any | Promise<any>
    "body:read": (payload: any, options: PayloadReadOptions) => any | Promise<any>
  }
}

export interface MongooseEventContext<D extends DocumentBase = DocumentBase> {
  model: DocumentModel<D>
  query: {
    fields: string[]
    filter: ((query: DocumentQuery<D>) => void)[]
    sortFields: [string, boolean][]
  }
}

export declare module h3 {
  interface H3EventContext {
      mongoose?: MongooseEventContext
  }
}