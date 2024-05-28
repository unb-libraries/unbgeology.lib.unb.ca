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
  type FetchEntityListOptions,
  type EntityJSONBodyPropertyValue,
  type EntityJSONProperties,
  FilterOperator,
  type FetchEntityOptions,
} from "@unb-libraries/nuxt-layer-entity"
import type { UseFetchOptions } from "nuxt/app"

export function defineEntityType<E extends Entity = Entity>(name: string, definition: Omit<EntityType<E>, `name`>): EntityType<E> {
  const baseURI = `/api/${name.toLowerCase()}`
  return defu(definition, {
    name,
    baseURI,
    uri: (entity: Partial<E>) => `${baseURI}/${entity.id}`,
  })
}

export function useEntityType<E extends Entity = Entity, Bc extends Partial<E> = Partial<E>, Bu extends Partial<E> = Partial<E>>(name: keyof AppConfig<E>[`entityTypes`]) {
  const { [name]: entityType } = useAppConfig().entityTypes
  return {
    definition: entityType,
    async create<B extends Bc = Bc>(entity: B) {
      return await createEntity<E, B>(entity, entityType)
    },
    async fetchByPK(pk: string, options?: Partial<FetchEntityOptions<E>>) {
      return await fetchEntity<E>(pk, entityType, options)
    },
    async fetchBy(condition: Partial<E>, options?: Partial<FetchEntityOptions<E>>) {
      const { entities, refresh } = await fetchEntityList<E>(entityType, {
        filter: Object.entries(condition).map(([key, value]) => [key, FilterOperator.EQUALS, value]),
        select: options?.select,
      })

      const entity = ref(entities.value[0] ?? null)
      return (entity && {
        entity: entity as Ref<EntityJSON<E> | null>,
        update: async (body: Bu) => {
          if (entity.value) {
            await updateEntity<E, Bu>({ self: entity.value.self, ...body })
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
      }) || undefined
    },
    async fetchAll() {
      return await fetchEntityList<E>(entityType)
    },
    async update<B extends Bu = Bu>(entity: B) {
      return await updateEntity<E, B>(entity)
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
        } else if (typeof ref === `object`) {
          return Object.fromEntries(Object.entries(ref).map(([key, value]) => [key, resolveReference(value)]))
        } else {
          return ref
        }
      }
      return [key, value ? resolveReference(value as EntityJSONPropertyValue) : undefined]
    })) as EntityJSONBody<E>
}

export async function createEntity <E extends Entity = Entity, B extends Partial<E> = Partial<E>> (entity: B, entityType: EntityType<E>): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity, B extends Partial<E> = Partial<E>> (entity: B, entityTypeId: string): Promise<EntityCreateResponse<E>>
export async function createEntity <E extends Entity = Entity, B extends Partial<E> = Partial<E>>(entity: B, entityTypeOrId: EntityType<E> | string): Promise<EntityCreateResponse<E>> {
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

export async function fetchEntity <E extends Entity = Entity> (pk: string, entityType: EntityType<E>, options?: Partial<FetchEntityOptions<E>>): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity> (uri: string, options?: Partial<FetchEntityOptions<E>>): Promise<EntityFetchResponse<E>>
export async function fetchEntity <E extends Entity = Entity>(pkOrUri: string, entityTypeOrOptions?: EntityType<E> | Partial<FetchEntityOptions<E>>, options?: Partial<FetchEntityOptions<E>>): Promise<EntityFetchResponse<E>> {
  // REFACTOR: fetch by filtering on PK, e.g. /api/terms/?filter=slug_eq_an-example
  const entityType = entityTypeOrOptions && [`name`, `baseURI`].every(key => key in entityTypeOrOptions) ? entityTypeOrOptions as EntityType<E> : undefined
  const url = entityType ? `${entityType?.baseURI}/${pkOrUri}` : pkOrUri
  const selectOptions = entityTypeOrOptions && `select` in entityTypeOrOptions
    ? entityTypeOrOptions.select
    : options && `select` in options
      ? options.select
      : []

  const { data, refresh } = await useFetch<EntityJSON<E>>(url, { query: { select: selectOptions } })
  const entity: Ref<EntityJSON<E> | null> = data as Ref<EntityJSON<E> | null>
  return {
    entity: entity as Ref<EntityJSON<E> | null>,
    update: async <B extends Partial<E> = Partial<E>>(body: B) => {
      if (entity.value) {
        await updateEntity<E, B>({ self: entity.value.self, ...body })
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

export async function updateEntity <E extends Entity = Entity, B extends Partial<E> = Partial<E>>(entity: B): Promise<EntityResponse<E>> {
  const { self, ...body } = entity
  const { data: updatedEntity } = await useFetch<EntityJSON<E>>(self, {
    // @ts-ignore
    method: `PATCH`,
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

export async function fetchEntityList <E extends Entity = Entity> (uriOrEntityTypeId: string, options?: FetchEntityListOptions): Promise<EntityListResponse<E>>
export async function fetchEntityList <E extends Entity = Entity> (entityType: EntityType<E>, options?: FetchEntityListOptions): Promise<EntityListResponse<E>>
export async function fetchEntityList <E extends Entity = Entity>(entityTypeOrIdOrURI: string | EntityType<E>, options?: FetchEntityListOptions): Promise<EntityListResponse<E>> {
  const url = typeof entityTypeOrIdOrURI === `string`
    ? entityTypeOrIdOrURI.startsWith(`/`)
      ? entityTypeOrIdOrURI
      : useEntityType<E>(entityTypeOrIdOrURI)?.definition.baseURI
    : entityTypeOrIdOrURI.baseURI

  const filter = ref(options?.filter ?? [])
  const page = ref(options?.page ?? 1)
  const pageSize = ref(options?.pageSize ?? 25)
  const search = ref(options?.search ?? ``)
  const select = ref(options?.select ?? [])
  const sort = ref(options?.sort ?? [])

  const fetchOptions: UseFetchOptions<EntityJSONList<E>> = {
    query: {
      filter: computed(() => filter.value.map(f => f.join(`:`))),
      page,
      pageSize,
      search,
      select,
      sort,
    },
  }

  const resetPage = () => { page.value = 1 }
  watch(search, resetPage)
  watch(filter, resetPage)

  const { data: list, refresh } = await useFetch<EntityJSONList<E>>(url, fetchOptions)
  return {
    list: list as Ref<EntityJSONList<E> | null>,
    entities: computed(() => list.value?.entities ?? []),
    query: {
      filter,
      page,
      pageSize,
      search,
      select,
      sort,
    },
    refresh,
    async add(entity: EntityJSONCreateBody<E>) {
      const response = typeof entityTypeOrIdOrURI === `string`
        ? await createEntity(entity, entityTypeOrIdOrURI)
        : await createEntity(entity, entityTypeOrIdOrURI)
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
    async removeMany(entities: EntityJSON<E>[]) {
      const options = {
        filter: entities.map<[string, FilterOperator, string]>(({ id }) => [`id`, FilterOperator.EQUALS, id]),
      }
      typeof entityTypeOrIdOrURI === `string`
        ? await deleteEntityList(entityTypeOrIdOrURI, options)
        : await deleteEntityList(entityTypeOrIdOrURI.name, options)
      refresh()
    },
    errors: [],
  }
}

async function deleteEntityList<E extends Entity = Entity>(entityTypeID: string, options?: FetchEntityListOptions) {
  const { filter, page, pageSize, search, select, sort } = options ?? {}
  const fetchOptions: UseFetchOptions<EntityJSONList<E>> = {
    method: `DELETE`,
    query: { filter: filter?.map(f => f.join(`:`)), page, pageSize, search, select, sort },
  }
  const url = useEntityType<E>(entityTypeID).definition.baseURI
  return await useFetch<EntityJSONList<E>>(url, fetchOptions)
}
