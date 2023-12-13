import { defu } from "defu"
import { type AppConfig } from "nuxt/schema"
import {
  type Entity,
  type EntityType,
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
} from "layers/base/types/entity"

export function defineEntityType<E extends Entity = Entity>(name: string, definition: Omit<EntityType<E>, `name`>): EntityType<E> {
  const baseURI = `/api/${name.toLowerCase()}`
  return defu(definition, {
    name,
    baseURI,
    uri: (entity: Partial<E>) => `${baseURI}/${entity.id}`,
  })
}

export function useEntityType<E extends Entity = Entity>(name: keyof AppConfig<E>[`entityTypes`]) {
  const { [name]: entityType } = useAppConfig().entityTypes
  return {
    definition: entityType,
    async create(entity: EntityJSONCreateBody<E>) {
      return await createEntity<E>(entity, entityType)
    },
    async fetchByPK(pk: string) {
      return await fetchEntity<E>(pk, entityType)
    },
    async fetchAll() {
      return await fetchEntityList<E>(entityType)
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
      return [key, value ? resolveReference(value as EntityJSONPropertyValue) : undefined]
    })) as EntityJSONBody<E>
}

export async function createEntity <E extends Entity = Entity> (entity: EntityJSONCreateBody<E>, entityType: EntityType<E>): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity> (entity: EntityJSONCreateBody<E>, entityTypeId: string): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity>(entity: EntityJSONCreateBody<E>, entityTypeOrId: EntityType<E> | string): Promise<EntityCreateResponse<E>> {
  const url = typeof entityTypeOrId === `string`
    ? useEntityType<E>(entityTypeOrId).definition.baseURI
    : entityTypeOrId.baseURI

  const { data: newEntity } = await useFetch<E>(url, {
    // @ts-ignore
    method: `POST`,
    body: entity,
  })
  return await fetchEntity<E>((newEntity.value as EntityJSON<E>).self)
}

export async function fetchEntity <E extends Entity = Entity> (pk: string, entityType: EntityType<E>): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity> (uri: string): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity>(pkOrUri: string, entityType?: EntityType<E>): Promise<EntityFetchResponse<E>> {
  // REFACTOR: fetch by filtering on PK, e.g. /api/terms/?filter=slug_eq_an-example
  const url = entityType ? `${entityType?.baseURI}/${pkOrUri}` : pkOrUri

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

export async function deleteEntity (pk: string, entityType: EntityType): Promise<EntityDeleteResponse>
export async function deleteEntity (entityReference: EntityJSONReference): Promise<EntityDeleteResponse>
export async function deleteEntity(entityReferenceOrPk: EntityJSONReference | string, entityType?: EntityType): Promise<EntityDeleteResponse> {
  let url
  if (typeof entityReferenceOrPk === `string` && entityType) {
    const { fetchByPK } = useEntityType(entityType.name)
    const { entity } = await fetchByPK(entityReferenceOrPk)
    if (entity) {
      url = entity.value!.self
    }
  } else {
    url = (entityReferenceOrPk as EntityJSONReference).self
  }

  if (url) {
    const { error } = await useFetch(url, { method: `DELETE` })
    return {
      success: !error.value,
      errors: [],
    }
  }
  throw createError(`Entity ${entityReferenceOrPk} not found.`)
}

export async function fetchEntityList <E extends Entity = Entity> (entityTypeId: string): Promise<EntityListResponse<E>>
export async function fetchEntityList <E extends Entity = Entity> (entityType: EntityType<E>): Promise<EntityListResponse<E>>
export async function fetchEntityList <E extends Entity = Entity>(entityTypeOrId: string | EntityType<E>) {
  const url = typeof entityTypeOrId === `string`
    ? useEntityType<E>(entityTypeOrId).definition.baseURI
    : entityTypeOrId.baseURI

  const { data: list, refresh } = await useFetch<EntityJSONList<E>>(url)
  return {
    list: list as Ref<EntityJSONList<E> | null>,
    entities: computed(() => list.value?.entities ?? []),
    refresh,
    async add(entity: EntityJSONCreateBody<E>) {
      const response = typeof entityTypeOrId === `string`
        ? await createEntity(entity, entityTypeOrId)
        : await createEntity(entity, entityTypeOrId)
      refresh()
      return response
    },
    async update(entity: EntityJSONBody<E>) {
      const response = await updateEntity(entity)
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
