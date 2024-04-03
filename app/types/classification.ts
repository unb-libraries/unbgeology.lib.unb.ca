import { type TaxonomyTerm, type Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  MIGRATED = 1,
  DRAFT = 2,
  PUBLISHED = 4,
}

export enum Rank {
  KINGDOM = 1,
  PHYLUM = 2,
  SUBPHYLUM = 4,
  CLASS = 8,
  SUBCLASS = 16,
  ORDERS = 32,
}

export interface Classification extends TaxonomyTerm, Stateful<typeof Status> {
}

export interface FossilClassification extends Classification {
  rank: Rank
}

export interface MineralClassification extends Classification {
  composition?: string
}

export interface RockClassification extends Classification {
}
