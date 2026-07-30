import type { Entity, File, Slugified } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen } from "types/specimen"

export enum LoanType {
  INCOMING = 1,
  OUTGOING = 2,
}

export interface Loan extends Entity, Slugified {
  type: LoanType
  description?: string
  start: string
  end: string
  contact: {
    name: string
    affiliation: string
    email: string
    phone: string
  }
  specimens: Specimen[]
  contract?: File
}
