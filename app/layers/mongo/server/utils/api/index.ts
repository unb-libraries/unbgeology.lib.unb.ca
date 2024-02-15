import { defu } from "defu"
import { type Document, type Types } from "mongoose"
import { type H3Event } from "h3"
import { type EntityJSON, type Entity, type EntityJSONBody, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type QueryOptions, type EntityListOptions, type DocumentQuery } from "../../../types/entity"
import { EntityBodyCardinality, type EntityBodyReaderOptions } from "../../../types/api"

export function getSelectedFields(fields: string[], prefix?: string) {
  if (prefix) {
    return fields.filter(f => f.startsWith(prefix)).map(f => f.split(`.`)[1])
  }
  return fields.map(f => f.split(`.`)[0])
}

export function defineDocumentQueryHandler<TOptions>(handler: (query: DocumentQuery, options: TOptions) => void | Promise<void>) {
  return function (query: DocumentQuery, options: TOptions) {
    handler(query, options)
  }
}

export function getQueryOptions(event: H3Event): QueryOptions {
  const { filter, select, sort, search, ...query } = getQuery(event)
  let { page, pageSize } = query

  pageSize = pageSize ? Array.isArray(pageSize) ? parseInt(`${pageSize.at(-1)}`) : parseInt(`${pageSize}`) : 25
  pageSize = Math.min(Math.max(1, pageSize), 100)

  page = page ? Array.isArray(page) ? parseInt(`${page.at(-1)}`) : parseInt(`${page}`) : 1
  page = Math.max(1, page)

  const selection: string[] = select ? Array.isArray(select) ? select : [select] : []

  return {
    page,
    pageSize,
    select: selection,
    filter: Object.entries((filter ? Array.isArray(filter) ? filter : [filter] : [])
      .map<string[3]>(f => f.split(`:`))
      .map<[string, number, string]>(([field, op, value]) => [field, !isNaN(parseInt(op)) ? parseInt(op) : useEnum(FilterOperator).toNumber(op), value])
      .reduce((obj, [field, newOp, newValue]) => {
        if (!obj[field]) {
          obj[field] = [newOp, newValue]
        } else {
          const [op, value] = obj[field]
          obj[field] = [op | newOp, newValue ? Array.isArray(value) ? [...value, newValue] : [value, newValue] : value]
        }
        return obj
      }, {} as Record<string, [number, string | string[]]>))
      .map(([field, [op, value]]) => [field, op, value]),
    filterSelect({ root, prefix, default: defaultFields }) {
      const fields = defaultFields ?? []
      if (root) {
        const nestedFields = selection
          .filter(f => f.startsWith(root))
          .map(f => f.substring(root.length))
          .filter(f => f)
          .map(f => f.split(`.`).filter(c => c)[0])
        fields.push(...nestedFields)
      } else {
        fields.push(...selection
          .map(f => f.split(`.`)[0]))
      }
      return prefix ? fields.map(f => `${prefix}.${f}`) : fields
    },
    search: Array.isArray(search) ? search.at(-1) : search,
    sort: sort ? Array.isArray(sort) ? sort : [sort] : [],
  }
}

export function defineEntityBodyReader<E extends Entity = Entity>(reader: (body: EntityJSONBody<E>) => EntityJSONBody<E> | Promise<EntityJSONBody<E>>) {
  return async (event: H3Event, options?: EntityBodyReaderOptions): Promise<EntityJSONBody<E> | EntityJSONBody<E>[]> => {
    options = defu(options, { cardinality: EntityBodyCardinality.MANY | EntityBodyCardinality.ONE } as const)
    const body = await readBody(event)

    async function readOne(body: any) {
      return await reader(body)
    }

    async function readMany(body: any[]) {
      return await Promise.all(body.map(async body => await reader(body)))
    }

    switch (options.cardinality) {
      case EntityBodyCardinality.ONE: {
        if (Array.isArray(body)) {
          throw new TypeError(`Body must be of type object.`)
        }
        return readOne(body)
      }
      case EntityBodyCardinality.MANY: {
        if (!Array.isArray(body)) {
          throw new TypeError(`Body must be of type array.`)
        }
        return readMany(body)
      }
      case EntityBodyCardinality.ONE | EntityBodyCardinality.MANY:
      default: {
        return !Array.isArray(body) ? await readOne(body) : await readMany(body)
      }
    }
  }
}

export function defineEntityFormatter<E extends Entity = Entity, T = any>(formatter: (item: T) => Partial<EntityJSON<E>>, options?: Partial<{ removeEmpty: boolean }>) {
  return function (item: T): Partial<EntityJSON<E>> {
    const entity = formatter(item)
    return Object
      .entries(entity)
      .filter(([_, value]) => (value !== undefined) || (options?.removeEmpty === false))
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
  }
}

export async function readEntityBody<E extends Entity = Entity>(event: H3Event, reader: (body: any, event: H3Event) => EntityJSONBody<E> | Promise<EntityJSONBody<E>>, options?: EntityBodyReaderOptions) {
  options = defu(options, { cardinality: EntityBodyCardinality.MANY | EntityBodyCardinality.ONE } as const)
  const body = await readBody(event)

  async function readOne(body: any) {
    return await reader(body, event)
  }

  async function readMany(body: any[]) {
    return await Promise.all(body.map(async body => await reader(body, event)))
  }

  switch (options.cardinality) {
    case EntityBodyCardinality.ONE: {
      if (Array.isArray(body)) {
        throw new TypeError(`Body must be of type object.`)
      }
      return readOne(body)
    }
    case EntityBodyCardinality.MANY: {
      if (!Array.isArray(body)) {
        throw new TypeError(`Body must be of type array.`)
      }
      return readMany(body)
    }
    case EntityBodyCardinality.ONE | EntityBodyCardinality.MANY:
    default: {
      return !Array.isArray(body) ? await readOne(body) : await readMany(body)
    }
  }
}

export function createEntity <E extends Entity = Entity>(event: H3Event, entity: Partial<EntityJSON<E>>, options?: Partial<{ self: string | ((entity: Partial<EntityJSON<E>>) => string) }>) {
  return {
    ...entity,
    self: options?.self
      ? typeof options.self === `function`
        ? options.self(entity)
        : options.self
      : getRequestURL(event).pathname,
  }
}

export function createEntityOr404 <E extends Entity = Entity>(event: H3Event, entity?: Partial<EntityJSON<E>>, options?: Partial<{ self: string | ((entity: Partial<EntityJSON<E>>) => string), message: string }>) {
  if (entity) {
    return createEntity(event, entity, options)
  }
  return createError({ statusCode: 404, statusMessage: options?.message ? options.message : `The requested entity does not exist.` })
}

export function createEntityList <E extends Entity = Entity>(event: H3Event, entities: Partial<EntityJSON<E>>[], options?: Partial<{ self: Partial<{ canonical: string | ((entity: Partial<EntityJSON<E>>) => string), list: string }>, total: number, page: number, pageSize: number }>) {
  const paginator = usePaginator(event, {
    total: options?.total ? options.total : entities.length,
  })

  return {
    self: options?.self?.list ? options.self.list : getRequestURL(event).pathname,
    entities: entities.map(entity => createEntity(event, entity, { self: options?.self?.canonical })),
    ...paginator,
  }
}
