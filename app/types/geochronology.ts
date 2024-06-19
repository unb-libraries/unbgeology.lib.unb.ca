import { type Hierarchical, type Stateful, type Term } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export enum Division {
  EON = 1,
  ERA = 2,
  PERIOD = 4,
  SUBPERIOD = 8,
  EPOCH = 16,
  AGE = 32,
}

export interface Unit extends Term, Hierarchical<Unit>, Stateful<typeof Status> {
  division: Division
  start: number
  gssp?: boolean
  uncertainty?: number
  color: string
}

export type UnitFormData = Partial<Omit<Unit, keyof Omit<Term, `label`>>>
