import { type TaxonomyTerm } from "@unb-libraries/nuxt-layer-entity"

export enum Division {
  AGE = `age`,
  EPOCH = `epoch`,
  PERIOD = `period`,
  ERA = `era`,
  EON = `eon`,
}

export interface Unit extends TaxonomyTerm {
  division: Division
  boundaries: {
    lower: number
    upper: number
  }
  gssp?: boolean
  uncertainty?: number
  color: string
}
