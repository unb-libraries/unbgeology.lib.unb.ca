import type { Term, Hierarchical, Stateful } from "@unb-libraries/nuxt-layer-entity"

export enum Status {
  DRAFT = 1,
  PUBLISHED = 2,
}

export enum Rank {
  KINGDOM = 1,
  PHYLUM = 2,
  SUBPHYLUM = 4,
  CLASS = 8,
  SUBCLASS = 16,
  ORDERS = 32,
}

export type Classification<T extends object = {}> = Term & Hierarchical<Term & T> & Stateful<typeof Status> & T
export type ClassificationFormData<T extends object = {}> = Pick<Classification<T>, `label` | `parent` | `type`> & Pick<Partial<Classification>, `status`>

export type Fossil = Classification<{ rank: Rank }>
export type FossilFormData = ClassificationFormData & Pick<Fossil, `rank`>

export type Mineral = Classification<{ composition?: string }>
export type MineralFormData = ClassificationFormData & Pick<Mineral, `composition`>

export type Rock = Classification
export type RockFormData = ClassificationFormData
