import {
  type Entity,
  type EntityJSON,
  type EntityJSONReference,
  type EntityJSONPropertyValue,
  type EntityJSONList,
  type EntityJSONBody,
  type EntityJSONCreateBody,
  type EntityResponse,
  type EntityFetchResponse,
  type EntityCreateResponse,
  type EntityDeleteResponse,
  type EntityListResponse,
  type EntityJSONBodyPropertyValue,
  type EntityJSONProperties,
} from "~/layers/base/types/entity"

const useBaseUrl = function (entityType: symbol, bundle: string = ``) {
  return `/api/${entityType.description}${bundle ? `/${bundle}` : ``}`
}

export function useEntityType <E extends Entity = Entity>(entityType: symbol, bundle: string = ``) {
  return {
    async create(entity: EntityJSONCreateBody<E>) {
      return await createEntity<E>(entity, entityType, bundle)
    },
    async fetchByPK(pk: string) {
      return await fetchEntity<E>(pk, entityType, bundle)
    },
    async fetchAll() {
      return await fetchEntityList<E>(useBaseUrl(entityType, bundle))
    },
    async update(entity: EntityJSONBody<E>) {
      return await updateEntity<E>(entity)
    },
    async remove(entity: EntityJSONReference) {
      return await deleteEntity(entity)
    },
  }
}

export function getEntityPayload <E extends Entity = Entity, P extends keyof Omit<E, keyof Entity> = keyof Omit<E, keyof Entity>>(entity: EntityJSONProperties<E, P> & Partial<EntityJSON<Entity>>): EntityJSONBody<E> {
  const baseUrl = entity.self
  return Object.fromEntries(Object.entries(entity)
    .filter(([key, _]) => ![`id`, `created`, `updated`].includes(key))
    .map(([key, value]) => {
      const resolveReference = (ref: EntityJSONPropertyValue | EntityJSONPropertyValue[]): EntityJSONBodyPropertyValue | EntityJSONBodyPropertyValue[] => {
        if (Array.isArray(ref)) {
          return ref.map(r => resolveReference(r)).flat()
        } else if (typeof ref === `object` && ref.self && baseUrl) {
          return !ref.self.startsWith(baseUrl) ? ref.self : getEntityPayload(ref)
        } else {
          return ref
        }
      }
      return [key, resolveReference(value as EntityJSONPropertyValue)]
    })) as EntityJSONBody<E>
}

export async function createEntity <E extends Entity = Entity> (entity: EntityJSONCreateBody<E>, entityType: symbol, bundle?: string): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity> (entity: EntityJSONCreateBody<E>, uri: string): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity>(entity: EntityJSONCreateBody<E>, entityTypeOrUri: string | symbol, bundle: string = ``): Promise<EntityCreateResponse<E>> {
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

  const { data, refresh } = await useFetch<EntityJSON<E>>(url)
  const entity: Ref<EntityJSON<E> | null> = data as Ref<EntityJSON<E> | null>
  return {
    entity: entity as Ref<EntityJSON<E> | null>,
    update: async () => {
      if (entity.value) {
        await updateEntity<E>(getEntityPayload<E>(entity.value))
        refresh()
      }
    },
    remove: async () => {
      const { success } = await deleteEntity(entity.value as EntityJSON<E>)
      if (success) {
        entity.value = null
      }
    },
    errors: [],
  }
}

export async function updateEntity <E extends Entity = Entity>(entity: EntityJSONBody<E>): Promise<EntityResponse<E>> {
  const { self, ...body } = entity
  const { data: updatedEntity } = await useFetch<EntityJSON<E>>(self, {
    // @ts-ignore
    method: `PUT`,
    body,
  })

  return {
    entity: updatedEntity as Ref<EntityJSON<E> | null>,
    errors: [],
  }
}

export async function deleteEntity (pk: string, entityType: symbol, bundle?: string): Promise<EntityDeleteResponse>
export async function deleteEntity (entityReference: EntityJSONReference): Promise<EntityDeleteResponse>
export async function deleteEntity(entityReferenceOrPk: EntityJSONReference | string, entityType?: symbol, bundle: string = ``): Promise<EntityDeleteResponse> {
  const uri = typeof entityReferenceOrPk === `string` && entityType && bundle
    ? `${useBaseUrl(entityType, bundle)}/${entityReferenceOrPk}`
    : (entityReferenceOrPk as EntityJSONReference).self

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
