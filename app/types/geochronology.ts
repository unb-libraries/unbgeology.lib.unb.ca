import { type Hierarchical, type Stateful, type Term } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export enum Division {
  AGE = 1,
  EPOCH = 2,
  PERIOD = 4,
  ERA = 8,
  EON = 16,
}

export interface Unit extends Term, Hierarchical<Unit>, Stateful<typeof Status> {
  division: Division
  boundaries: {
    lower: number
    upper: number
  }
  gssp?: boolean
  uncertainty?: number
  color: string
}

export type UnitFormData = Partial<Omit<Unit, keyof Omit<Term, `label`> | `boundaries` | `uncertainty`>> & {
  boundaries: {
    upper: string
    lower: string
  }
  uncertainty: string
}
