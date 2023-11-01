export interface Entity {
  readonly id: string
  readonly created: string
  readonly updated: string
}

export interface EntityJSON<E extends Entity = Entity> extends E {
  readonly self: string
}

export interface EntityJSONList<E extends Entity = Entity> {
  entities: EntityJSON<E>[]
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

export interface EntityResponse<E> {
  entity: Ref<EntityJSON<E> | null>
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
  list: Ref<EntityJSONList<E> | null>
  refresh: () => void
  add: typeof createEntity<E>
  remove: typeof deleteEntity<E>
  errors: any[]
}

export interface User extends Entity {
  username: string
  profile: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

export interface Taxonomy extends Entity {
  label: string
  parent: Taxonomy
}

export interface File extends Entity {
  filename: string
  filepath: string
  filesize: number
  filetype: string
  persisted: boolean
  uploadName: string
}

export interface Image extends File {
  alt: string
  dimensions: {
    width: number
    height: number
  }
  title: string
}

export interface Document extends File {
}