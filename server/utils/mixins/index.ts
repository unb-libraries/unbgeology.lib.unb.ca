import Hierarchical, { type Hierarchical as IHierarchical } from "./Hierarchical"
import IPIKable, { type IPIKable as IIPIKable } from "./IPIKable"
import Slugified, { type Slugified as ISlugified } from "./Slugified"
import Stateful, { type Stateful as IStateful } from "./Stateful"

enum Status {}

export type Hierarchical<T> = IHierarchical<T>
export type IPIKable = IIPIKable
export type Slugified = ISlugified
export type Stateful<S extends typeof Status> = IStateful<S>

export {
  Hierarchical,
  IPIKable,
  Slugified,
  Stateful,
}
