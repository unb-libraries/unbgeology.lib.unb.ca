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

export interface EntityResponse<E> {
  entity: Ref<E | null>
  errors: any[]
}

export interface EntityFetchResponse<E extends Entity = Entity> extends EntityResponse<E> {
  update: () => Promise<void>
  remove: () => Promise<void>
}

export type EntityCreateResponse<E extends Entity = Entity> = EntityFetchResponse<E>

export interface EntityDeleteResponse {
  success: boolean
  errors: any[]
}

export interface EntityListResponse<E extends Entity = Entity> {
  list: Ref<EntityList<E> | null>
  add: typeof createEntity<E>
  remove: typeof deleteEntity<E>
  errors: any[]
}