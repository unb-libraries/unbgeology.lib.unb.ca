import type { Term, Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export interface Collection extends Term, Stateful<typeof Status> {
}
