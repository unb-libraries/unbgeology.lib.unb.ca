import { type Entity } from "./entity"

export interface Taxonomy extends Entity {
  label: string
  slug: string
  parent?: Taxonomy
}
