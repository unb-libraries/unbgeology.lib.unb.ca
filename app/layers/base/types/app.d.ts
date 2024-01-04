import { type EntityType } from "@unb-libraries/nuxt-layer-entity"

declare module "nuxt/schema" {
  interface AppConfigInput {
    entityTypes: Record<string, ReturnType<typeof defineEntityType>>
  }
  
  interface AppConfig {
    entityTypes: Record<string, ReturnType<typeof defineEntityType>>
  }
}