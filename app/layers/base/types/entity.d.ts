export interface Entity {
  self: string
  created: string
  updated: string
}

export interface EntityList<E extends Entity = Entity> {
  items: E[]
  nav: {
    first?: string
    last?: string
    next?: string
    prev?: string
  }
  page: number
  pageSize: number
  self: string
  totalItems: number
}

export interface Taxonomy extends Entity {
  label: string
  parent: string
}