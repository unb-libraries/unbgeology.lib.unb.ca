import { type DiscriminatedEntity } from "./entity"

export interface Taxonomy extends DiscriminatedEntity {
  label: string
  slug: string
  parent?: Taxonomy
}
