import type { Entity, File } from "@unb-libraries/nuxt-layer-entity"
import type { Specimen } from "types/specimen"

export interface Loan extends Entity {
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
