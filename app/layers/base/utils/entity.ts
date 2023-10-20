import {
  type Entity,
  type EntityList,
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
    async update(entity: E) {
      return await updateEntity<E>(entity)
    },
    async remove(entity: E) {
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
  return await fetchEntity<E>((newEntity.value as E).self)
}

export async function fetchEntity <E extends Entity = Entity> (pk: string, entityType: symbol, bundle?: string): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity> (uri: string): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity>(pkOrUri: string, entityType?: symbol, bundle: string = ``): Promise<EntityFetchResponse<E>> {
  const url = entityType
    ? `${useBaseUrl(entityType, bundle)}/${pkOrUri}`
    : pkOrUri

  const { data: entity, refresh } = await useFetch<E>(url)
  return {
    entity: entity as Ref<E | null>,
    update: async () => {
      if (entity.value) {
        await updateEntity<E>(entity.value as E)
        refresh()
      }
    },
    remove: async () => {
      const { success } = await deleteEntity<E>(entity.value as E)
      if (success) {
        entity.value = null
      }
    },
    errors: [],
  }
}

export async function updateEntity <E extends Entity = Entity>(entity: E): Promise<EntityResponse<E>> {
  const update = { ...entity };
  [`self`, `created`, `updated`].forEach(prop => delete update[prop as keyof Partial<E>])
  const { data: updatedEntity } = await useFetch<E>(entity.self, {
    // @ts-ignore
    method: `PUT`,
    body: update,
  })

  return {
    entity: updatedEntity as Ref<E | null>,
    errors: [],
  }
}

export async function deleteEntity <E extends Entity = Entity> (pk: string, entityType: symbol, bundle?: string): Promise<EntityDeleteResponse>
export async function deleteEntity <E extends Entity = Entity> (entity: E): Promise<EntityDeleteResponse>
export async function deleteEntity <E extends Entity = Entity>(entityOrPk: E | string, entityType?: symbol, bundle: string = ``): Promise<EntityDeleteResponse> {
  const uri = typeof entityOrPk === `string` && entityType && bundle
    ? `${useBaseUrl(entityType, bundle)}/${entityOrPk}`
    : (entityOrPk as E).self

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
  const { data: list, refresh } = await useFetch<EntityList<E>>(url)
  return {
    list: list as Ref<EntityList<E> | null>,
    async add(entity: E) {
      const response = typeof entityTypeOrUri === `symbol`
        ? await createEntity(entity, entityTypeOrUri, bundle)
        : await createEntity(entity, entityTypeOrUri)
      refresh()
      return response
    },
    async remove(entity: E) {
      const response = await deleteEntity(entity)
      refresh()
      return response
    },
    errors: [],
  }
}
