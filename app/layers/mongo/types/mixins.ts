import { Status } from "@unb-libraries/nuxt-layer-entity"

export interface Stateful<T extends typeof Status> {
  status: T[keyof T]
}

export interface StatefulOptions<T extends typeof Status> {
  values: T
  default: T[keyof T]
}
