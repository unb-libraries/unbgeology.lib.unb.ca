import { type Term, type Hierarchical, type Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  PUBLISHED = 4,
}

export interface StorageLocation extends Term, Hierarchical<StorageLocation>, Stateful<typeof Status> {
  public: boolean
}

export type StorageLocationPayload = Partial<Pick<StorageLocation, `label` | `public`> & { parent?: string }>
