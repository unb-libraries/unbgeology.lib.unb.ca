import { type TaxonomyTerm, type Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export interface StorageLocation extends TaxonomyTerm, Stateful<typeof Status> {
  public: boolean
}
