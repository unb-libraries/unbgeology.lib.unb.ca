import { type TaxonomyTerm } from "layers/base/types/entity"

export interface Classification extends TaxonomyTerm {
}

export interface StorageLocation extends TaxonomyTerm {
  public: boolean
}
