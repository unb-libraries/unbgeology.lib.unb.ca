import { type Stateful, type TaxonomyTerm } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  PUBLISHED = 4,
}

export enum Division {
  AGE = `age`,
  EPOCH = `epoch`,
  PERIOD = `period`,
  ERA = `era`,
  EON = `eon`,
}

export interface Unit extends TaxonomyTerm, Stateful<typeof Status> {
  division: Division
  boundaries: {
    lower: number
    upper: number
  }
  gssp?: boolean
  uncertainty?: number
  color: string
}
