import type { Term, Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export interface Composition extends Term, Stateful<typeof Status> {
}

export type CompositionCreateBody = Pick<Composition, `label` | `type`> & Pick<Partial<Composition>, `status`>
export type CompositionUpdateBody = Pick<Partial<Composition>, `label` | `status`>
