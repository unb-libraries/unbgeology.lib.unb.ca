import { Status } from "@unb-libraries/nuxt-layer-entity"

export interface Slugified {
  slug: string
}

export interface SlugifiedOptions<D = any> {
  path: Omit<keyof D, keyof Slugified> | Omit<keyof D, keyof Slugified>[] | ((doc: Omit<D, keyof Slugified>) => string)
}

export interface Stateful<T extends typeof Status> {
  status: T[keyof T]
}

export interface StatefulOptions<T extends typeof Status> {
  values: T
  default: T[keyof T]
}
