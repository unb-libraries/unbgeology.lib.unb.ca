import { type Taxonomy } from "layers/base/types/entity"

export interface Classification extends Taxonomy {
}

export interface StorageLocation extends Taxonomy {
  public: boolean
}