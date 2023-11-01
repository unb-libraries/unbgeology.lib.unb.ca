import {
  type Entity,
  type EntityJSON,
  type EntityJSONList,
  type EntityResponse,
  type EntityFetchResponse,
  type EntityCreateResponse,
  type EntityDeleteResponse,
  type EntityListResponse,
} from "~/layers/base/types/entity"

const useBaseUrl = function (entityType: symbol, bundle: string = ``) {
  return `/api/${entityType.description}${bundle ? `/${bundle}` : ``}`
}

export function useEntityType <E extends Entity = Entity>(entityType: symbol, bundle: string = ``) {
  return {
    async create(entity: E) {
      return await createEntity<E>(entity, entityType, bundle)
    },
    async fetchByPK(pk: string) {
      return await fetchEntity<E>(pk, entityType, bundle)
    },
    async fetchAll() {
      return await fetchEntityList<E>(useBaseUrl(entityType, bundle))
    },
    async update(entity: EntityJSON<E>) {
      return await updateEntity<E>(entity)
    },
    async remove(entity: EntityJSON<E>) {
      return await deleteEntity<E>(entity)
    },
  }
}

export async function createEntity <E extends Entity = Entity> (entity: E, entityType: symbol, bundle?: string): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity> (entity: E, uri: string): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity>(entity: E, entityTypeOrUri: string | symbol, bundle: string = ``): Promise<EntityCreateResponse<E>> {
  const url = typeof entityTypeOrUri === `symbol` ? useBaseUrl(entityTypeOrUri, bundle) : entityTypeOrUri
  const { data: newEntity } = await useFetch<E>(url, {
    // @ts-ignore
    method: `POST`,
    body: entity,
  })
  return await fetchEntity<E>((newEntity.value as EntityJSON<E>).self)
}

export async function fetchEntity <E extends Entity = Entity> (pk: string, entityType: symbol, bundle?: string): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity> (uri: string): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity>(pkOrUri: string, entityType?: symbol, bundle: string = ``): Promise<EntityFetchResponse<E>> {
  const url = entityType
    ? `${useBaseUrl(entityType, bundle)}/${pkOrUri}`
    : pkOrUri

  const { data: entity, refresh } = await useFetch<E>(url)
  return {
    entity: entity as Ref<EntityJSON<E> | null>,
    update: async () => {
      if (entity.value) {
        await updateEntity<E>(entity.value as EntityJSON<E>)
        refresh()
      }
    },
    remove: async () => {
      const { success } = await deleteEntity<E>(entity.value as EntityJSON<E>)
      if (success) {
        entity.value = null
      }
    },
    errors: [],
  }
}

export async function updateEntity <E extends Entity = Entity>(entity: EntityJSON<E>): Promise<EntityResponse<E>> {
  // eslint-disable-next-line
  const { self, created, updated, ...update } = entity
  const { data: updatedEntity } = await useFetch<EntityJSON<E>>(self, {
    // @ts-ignore
    method: `PUT`,
    body: update,
  })

  return {
    entity: updatedEntity as Ref<EntityJSON<E> | null>,
    errors: [],
  }
}

export async function deleteEntity (pk: string, entityType: symbol, bundle?: string): Promise<EntityDeleteResponse>
export async function deleteEntity <E extends Entity = Entity> (entity: EntityJSON<E>): Promise<EntityDeleteResponse>
export async function deleteEntity <E extends Entity = Entity>(entityOrPk: EntityJSON<E> | string, entityType?: symbol, bundle: string = ``): Promise<EntityDeleteResponse> {
  const uri = typeof entityOrPk === `string` && entityType && bundle
    ? `${useBaseUrl(entityType, bundle)}/${entityOrPk}`
    : (entityOrPk as EntityJSON<E>).self

  const { error } = await useFetch(uri, { method: `DELETE` })
  return {
    success: !error.value,
    errors: [],
  }
}

export async function fetchEntityList <E extends Entity = Entity> (uri: string): Promise<EntityListResponse<E>>
export async function fetchEntityList <E extends Entity = Entity> (entityType: symbol, bundle?: string): Promise<EntityListResponse<E>>
export async function fetchEntityList <E extends Entity = Entity>(entityTypeOrUri: string | symbol, bundle: string = ``) {
  const url = typeof entityTypeOrUri === `symbol` ? useBaseUrl(entityTypeOrUri, bundle) : entityTypeOrUri
  const { data: list, refresh } = await useFetch<EntityJSONList<E>>(url)
  return {
    list: list as Ref<EntityJSONList<E> | null>,
    refresh,
    async add(entity: E) {
      const response = typeof entityTypeOrUri === `symbol`
        ? await createEntity(entity, entityTypeOrUri, bundle)
        : await createEntity(entity, entityTypeOrUri)
      refresh()
      return response
    },
    async remove(entity: EntityJSON<E>) {
      const response = await deleteEntity(entity)
      refresh()
      return response
    },
    errors: [],
  }
}
