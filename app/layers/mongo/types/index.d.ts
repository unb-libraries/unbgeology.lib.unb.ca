import type { Entity, EntityJSONBody, Migration } from "@unb-libraries/nuxt-layer-entity"
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
      error: (errorMessage: string) => void | Promise<void>
    }) => void | Promise<void>
  }
}