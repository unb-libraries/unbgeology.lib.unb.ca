import { type Hierarchical, type Stateful, type Term } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export enum Division {
  AGE = `age`,
  EPOCH = `epoch`,
  PERIOD = `period`,
  ERA = `era`,
  EON = `eon`,
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
