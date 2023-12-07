import { type EntityType } from "layers/base/types/entity"

declare module "nuxt/schema" {
  interface AppConfigInput<E extends Entity = Entity> {
    entityTypes: Record<string, ReturnType<typeof defineEntityType<E>>>
  }
  
  interface AppConfig<E extends Entity = Entity> {
    entityTypes: Record<string, ReturnType<typeof defineEntityType<E>>>
  }
}