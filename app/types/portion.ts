import type { Term, Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export interface Portion extends Term, Stateful<typeof Status> {
}
