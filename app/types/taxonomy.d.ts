import { type Taxonomy } from "layers/base/types/entity"

export interface Classification extends Taxonomy {
}

export enum Division {
  AGE = `age`,
  EPOCH = `epoch`,
  PERIOD = `period`,
  ERA = `era`,
  EON = `eon`,
}

export interface GeochronologicUnit extends Taxonomy {
  division: Division
  boundaries: {
    lower: number
    upper: number
  }
  gssp?: boolean
  uncertainty?: number
}

export interface StorageLocation extends Taxonomy {
  public: boolean
}
