import type { EntityJSON, EntityJSONBody, Migration, MigrationItem, MigrationStatus } from "@unb-libraries/nuxt-layer-entity"
import type { EntityDocument } from "./entity"
import type { SourceItem } from "./migrate"

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

export declare module "nitropack" {
  interface NitroRuntimeHooks {
    migrate: (migrationID: string) => void | Promise<void>
    "migrate:init": (migration: Migration, items: SourceItem[]) => void | Promise<void>
    "migrate:import": (items: MigrationItem[]) => void | Promise<void>
    "migrate:import:item": (data: any, migration: Migration, emits: {
      ready: <E extends Entity = Entity>(item: EntityJSONBody<E>) => void | Promise<void>
      require: (sourceID: number, migration: Migration) => void | Promise<void>
      error: (errorMessage: string) => void | Promise<void>
      skip: () => void | Promise<void>
    }) => void | Promise<void>
    "migrate:rollback": (items: MigrationItem[]) => void | Promise<void>
  }
}