import { defu } from "defu"
import { type Document, type Types } from "mongoose"
import { type H3Event } from "h3"
import { type EntityJSON, type Entity, type EntityJSONBody, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type QueryOptions, type EntityListOptions, type DocumentQuery } from "../../../types/entity"
import { EntityBodyCardinality, type EntityBodyReaderOptions } from "../../../types/api"
import { type DocumentBase, type DocumentModel } from "../../../types/schema"
import { type MongooseEventContext } from "~../../../types"

function initMongooseContext(event: H3Event) {
  event.context.mongoose = {
    model: undefined,
    query: {
      fields: [],
      filter: [],
      sortFields: [],
    },
  }
}

export function defineMongooseHandler<D extends DocumentBase = DocumentBase>(model: DocumentModel<D>, handler: Parameters<typeof defineEventHandler>[0]) {
  return defineEventHandler((event) => {
    if (!event.context.mongoose) {
      initMongooseContext(event)
    }
    event.context.mongoose.model = model
    return handler(event)
  })
}

export function getMongooseModel<D extends DocumentBase = DocumentBase>(event: H3Event): DocumentModel<D> {
  return event.context.mongoose?.model
}

export function getMongooseQuery(event: H3Event): MongooseEventContext[`query`] {
  if (!event.context.mongoose) {
    initMongooseContext(event)
  }
  return event.context.mongoose?.query as MongooseEventContext[`query`]
}

export function addMongooseField(event: H3Event, ...field: MongooseEventContext[`query`][`fields`]) {
  if (!event.context.mongoose) {
    initMongooseContext(event)
  }
  event.context.mongoose.query.fields.push(...field)
}

export function addMongooseSortField(event: H3Event, ...fields: MongooseEventContext[`query`][`sortFields`]) {
  if (!event.context.mongoose) {
    initMongooseContext(event)
  }
  event.context.mongoose.query.sortFields.push(...fields)
}

export function addMongooseFilter(event: H3Event, ...filters: MongooseEventContext[`query`][`filter`]) {
  if (!event.context.mongoose) {
    initMongooseContext(event)
  }
  event.context.mongoose.query.filter.push(...filters)
}

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

export function defineEntityBodyReader<E extends Entity = Entity>(reader: (body: any) => EntityJSONBody<E> | Promise<EntityJSONBody<E>>, options?: EntityBodyReaderOptions) {
  return async (event: H3Event) => {
    const body = await readBody(event)
    return await reader(body)
  }
}

export function defineBodyReader<TIn = any, TOut = TIn>(reader: (body: Partial<TIn>) => Partial<TOut> | Promise<Partial<TOut>>) {
  const extensions: ((body: any) => any | Promise<any>)[] = []

  const readOne = async (body: Partial<TIn>): Promise<Partial<TOut>> => {
    const bodies = await Promise.all([reader, ...extensions]
      .map(async reader => await reader(body)))
    return bodies.reduce((body, input) => ({ ...body, ...input }), {})
  }

  const readMany = async (body: Partial<TIn>[]): Promise<Partial<TOut>[]> => {
    return await Promise.all(body.map(async body => await readOne(body)))
  }

  const read = async (event: H3Event) => {
    const body = await readBody(event)
    return !Array.isArray(body)
      ? await readOne(body)
      : await readMany(body)
  }

  read.one = async (event: H3Event) => {
    const body = await readBody(event)
    if (Array.isArray(body)) {
      throw new TypeError(`Body must be of type object.`)
    }
    return readOne(body)
  }

  read.many = async (event: H3Event) => {
    const body = await readBody(event)
    if (!Array.isArray(body)) {
      throw new TypeError(`Body must be of type array.`)
    }
    return readMany(body)
  }

  read.append = (reader: <TInx extends TIn = TIn, TOutx extends TOut = TOut>(body: Partial<TInx>) => Partial<TOutx> | Promise<Partial<TOutx>>) => {
    extensions.push(reader)
    return read
  }

  return read
}

export function defineFormatter<TOutput extends object = object, TInput extends object = object>(formatter: (item: TInput) => TOutput, options?: Partial<{ removeEmpty: boolean }>) {
  return function (item: TInput): TOutput {
    const output = formatter(item)
    return Object.fromEntries(Object
      .entries(output)
      .filter(([_, value]) => (value !== undefined) || (options?.removeEmpty === false))) as TOutput
  }
}

export function defineEntityFormatter<E extends Entity = Entity, T = any>(formatter: (item: T) => EntityJSON<E>) {
  const format = {
    formatEntity(item: T, options?: Partial<{ self: (entity: Omit<EntityJSON<E>, `self`>) => string, removeEmpty: boolean }>): EntityJSON<E> {
      const entity = Object
        .entries(formatter(item))
        .filter(([_, value]) => (value !== undefined) || (options?.removeEmpty === false))
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}) as Omit<EntityJSON<E>, `self`>

      const self = options?.self ? options.self(entity) : getRequestURL(useEvent()).pathname
      return { self, ...entity }
    },
    formatEntityList(items: T[], options?: Partial<{ self: Partial<{ list: string, canonical: (entity: Omit<EntityJSON<E>, `self`>) => string}>, removeEmpty: boolean, total: number, page: number, pageSize: number }>) {
      const event = useEvent()
      const { pathname } = getRequestURL(event)

      const queryOptions = getQueryOptions(event)
      const self = options?.self?.list ?? pathname

      const canonicalSelf = options?.self?.canonical ?? ((entity: Omit<EntityJSON<E>, `self`>) => self.trim().split(`/`).concat(entity.id).join(`/`))
      const entities = items.map(item => format.formatEntity(item, { self: canonicalSelf, removeEmpty: options?.removeEmpty }))

      const paginator = usePaginator({
        total: options?.total ? options.total : entities.length,
        page: options?.page ?? queryOptions.page,
        pageSize: options?.pageSize ?? queryOptions.pageSize,
      })

      return {
        self,
        entities,
        ...paginator,
      }
    },
  }

  return format
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

export function createContentOr404<T = any>(content?: T, options?: Partial<{ message: string }>) {
  return content ?? createError({ statusCode: 404, statusMessage: options?.message ? options.message : `The requested entity does not exist.` })
}
