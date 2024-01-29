import { defu } from "defu"
import { type Document, type Types } from "mongoose"
import { type H3Event } from "h3"
import { type EntityJSON, type Entity, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"
import { type QueryOptions, type EntityListOptions } from "../../../types/entity"
import { EntityBodyCardinality, type EntityBodyReaderOptions } from "../../../types/api"

export function getSelectedFields(fields: string[], prefix?: string) {
  if (prefix) {
    return fields.filter(f => f.startsWith(prefix)).map(f => f.split(`.`)[1])
  }
  return fields.map(f => f.split(`.`)[0])
}

export function getQueryOptions(event: H3Event): QueryOptions {
  const { filter: filterQuery, select, sort, ...query } = getQuery(event)
  let { page, pageSize } = query

  const filters = filterQuery ? Array.isArray(filterQuery) ? filterQuery : [filterQuery] : []
  const filter = filters.reduce((obj, f) => {
    const [field, op, value] = f.split(`__`)
    if (!obj[field]) {
      obj[field] = {}
    }
    if (!obj[field][op]) {
      obj[field][op] = []
    }
    obj[field][op].push(value)
    return obj
  }, {})

  pageSize = pageSize ? Array.isArray(pageSize) ? parseInt(`${pageSize.at(-1)}`) : parseInt(`${pageSize}`) : 25
  pageSize = Math.min(Math.max(1, pageSize), 100)

  page = page ? Array.isArray(page) ? parseInt(`${page.at(-1)}`) : parseInt(`${page}`) : 1
  page = Math.max(1, page)

  const selection: string[] = select ? Array.isArray(select) ? select : [select] : []

  return {
    page,
    pageSize,
    select: selection,
    filter,
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

export function sendEntity <E extends Entity = Entity>(event: H3Event, entity: Document<Types.ObjectId, {}, E>, transform?: (entity: EntityJSON<E>) => EntityJSON<E>) {
  let json = entity.toJSON<EntityJSON<E>>({ flattenMaps: false })
  if (transform) {
    json = transform(json)
  }
  return json
}

export function sendEntityList <E extends Entity = Entity>(event: H3Event, entities: Document<Types.ObjectId, {}, E>[], options?: EntityListOptions<E>) {
  const { pathname } = getRequestURL(event)
  const paginator = usePaginator(event, { total: options?.total ?? entities.length })

  return {
    self: pathname,
    entities: entities.map((entity) => {
      let json = entity.toJSON<EntityJSON<E>>({ flattenMaps: false })
      if (options?.transform) {
        json = options.transform(json)
      }
      return json
    }),
    ...paginator,
  }
}

export function sendEntityOr404 <E extends Entity = Entity>(event: H3Event, entity?: Document<Types.ObjectId, {}, E>, transform?: (entity: EntityJSON<E>) => EntityJSON<E>) {
  if (entity) {
    return sendEntity<E>(event, entity, transform)
  }
  throw createError({ statusCode: 404, statusMessage: `The requested resource does not exist.` })
}
