export interface Entity {
  readonly id: string
  readonly created: string
  readonly updated: string
}

export interface EntityJSONReference {
  readonly self: string
  readonly id: string
}

export type EntityJSONInclusion<E extends Entity = Entity> = EntityJSON<Partial<E>>
export type EntityJSONPropertyValue = string | number | boolean | EntityJSONReference
export type EntityJSON<E extends Entity = Entity> = {
  [P in keyof E]:
    E[P] extends Entity | Entity[] ? EntityJSONInclusion<E[P]> :
      E[P] extends Entity | Entity[] | undefined ? EntityJSONInclusion<E[P]> | undefined :
        E[P]
} & EntityJSONReference

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

export type EntityJSONBodyPropertyValue = Exclude<EntityJSONPropertyType, EntityJSONReference>
export type EntityJSONBody<E extends Entity = Entity> = { self : string } & {
  [P in keyof Omit<E, "id" | "created" | "updated">]:
    E[P] extends Entity[] ? string[] :
      E[P] extends Entity[] | undefined ? string[] | undefined :
        E[P] extends Entity ? string :
          E[P] extends Entity | undefined ? string | undefined :
            E[P]
}

export type EntityJSONCreateBody<E extends Entity = Entity> = Omit<EntityJSONBody<E>, "self">

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
export type JUser = EntityJSON<User>
export type JUserList = EntityJSONList<User>

export interface Taxonomy extends Entity {
  label: string
  parent: Taxonomy
}
export type JTaxonomy = EntityJSON<Taxonomy>
export type JTaxonomyList = EntityJSONList<Taxonomy>

export interface File extends Entity {
  filename: string
  filepath: string
  filesize: number
  filetype: string
  persisted: boolean
  uploadName: string
}
export type JFile = EntityJSON<Image>
export type JFileList = EntityJSONList<File>

export interface Image extends File {
  alt: string
  dimensions: {
    width: number
    height: number
  }
  title: string
}
export type JImage = EntityJSON<Image>
export type JImageList = EntityJSONList<Image>

export interface Document extends File {
}
export type JDocument = EntityJSON<Document>
export type JDocumentList = EntityJSONList<Document>