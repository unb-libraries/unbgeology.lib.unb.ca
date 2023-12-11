import { defineComponent } from "vue"

export interface DynamicContent {
  component: ReturnType<typeof defineComponent> | null
  props?: any
  eventHandlers?: any
}
