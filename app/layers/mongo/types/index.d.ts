import { H3Event } from "h3"
import type { Entity, EntityJSON, EntityJSONBody, Migration, MigrationItem, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import type { DocumentFindQuery, DocumentBaseQuery, DocumentQueryMethod, EntityDocument, DocumentQuery } from "./entity"
import type { SourceItem } from "./migrate"
import type Mongoose from "mongoose"
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
      },
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

export interface RenderOptions {
  event: H3Event
}

export interface PayloadReadOptions<P extends `create` | `update` = `create` | `update`> {
  event: H3Event
  op: P
}


export declare module "nitropack" {
  interface NitroRuntimeHooks {
    "mongoose:init": (mongoose: typeof Mongoose) => void | Promise<void>
    "mongoose:query:event": <D, M>(query: DocumentQuery<D, M>, context: { event: H3Event }) => void | Promise<void>
    
    // migrate hooks
    migrate: (migrationID: string) => void | Promise<void>
    "migrate:init": (migration: Migration, items: SourceItem[]) => void | Promise<void>
    "migrate:import": (migration: Migration, options?: MigrateOptions) => void | Promise<void>
    "migrate:import:item": MigrateHandler
    "migrate:import:item:done": (item: MigrationItem, entity?: EntityJSON<E>, error?: string) => void | Promise<void>
    "migrate:import:item:imported": <E extends Entity = Entity>(item: MigrationItem, entity: EntityJSON<E>) => void | Promise<void>
    "migrate:import:item:error": (item: MigrationItem, error: string) => void | Promise<void>
    "migrate:import:item:skipped": (item: MigrationItem) => void | Promise<void>
    "migrate:rollback": (migration: Migration) => void | Promise<void>
    "migrate:pause": (migration: Migration) => void | Promise<void>
    
    // Entity hooks
    "entity:render": (item: any, options: RenderOptions) => any | Promise<any>
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