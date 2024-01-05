import type { Migration } from "@unb-libraries/nuxt-layer-entity"
import type { EntityDocument } from "./entity"

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
    "migrate:item": (item: unknown, migration: EntityDocument<Migration>, emits: {
      success: (item: any) => void | Promise<void>
      error: (errorMessage: string) => void | Promise<void>
    }) => void | Promise<void>
  }
}