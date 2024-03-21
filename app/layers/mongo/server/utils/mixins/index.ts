import Hierarchical, { type Hierarchical as IHierarchical } from "./Hierarchical"
import Slugified, { type Slugified as ISlugified } from "./Slugified"
import Stateful, { type Stateful as IStateful } from "./Stateful"

enum Status {}

export type Hierarchical = IHierarchical
export type Slugified = ISlugified
export type Stateful<S extends typeof Status> = IStateful<S>

export {
  Hierarchical,
  Slugified,
  Stateful,
}
