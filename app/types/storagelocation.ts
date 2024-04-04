import { type TaxonomyTerm, type Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  PUBLISHED = 4,
}

export interface StorageLocation extends TaxonomyTerm, Stateful<typeof Status> {
  public: boolean
}
