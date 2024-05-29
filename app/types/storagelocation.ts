import { type Term, type Hierarchical, type Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export interface StorageLocation extends Term, Hierarchical<StorageLocation>, Stateful<typeof Status> {
  public: boolean
}
