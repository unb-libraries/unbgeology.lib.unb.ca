import { type TaxonomyTerm } from "layers/base/types/entity"

export interface Classification extends TaxonomyTerm {
}

export enum Division {
  AGE = `age`,
  EPOCH = `epoch`,
  PERIOD = `period`,
  ERA = `era`,
  EON = `eon`,
}

export interface GeochronologicUnit extends TaxonomyTerm {
  division: Division
  boundaries: {
    lower: number
    upper: number
  }
  gssp?: boolean
  uncertainty?: number
}

export interface StorageLocation extends TaxonomyTerm {
  public: boolean
}
