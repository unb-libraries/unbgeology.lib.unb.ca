import { defu } from "defu"
import { type H3Event } from "h3"
import { type EntityJSON, type Entity, type EntityJSONBody, type EntityUpdateResponse, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type QueryOptions, type DocumentQuery } from "../../../types/entity"
import { Cardinality, type EntityBodyReaderOptions, type FormatOptions, type FormatManyOptions } from "../../../types/api"
import { type DocumentBase, type DocumentModel } from "../../../types/schema"
import { Read, type Mutable, type MongooseEventContext } from "~../../../types"

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

export function defineBodyReader<TIn = any, TOut = TIn>(reader: (body: TIn) => TOut | Promise<TOut>) {
  const extensions: ((body: any) => any | Promise<any>)[] = []

  const readOne = async (body: TIn): Promise<TOut> => {
    const bodies = await Promise.all([reader, ...extensions]
      .map(async reader => await reader(body)))
    return bodies.reduce((body, input) => ({ ...body, ...input }), {})
  }

  const readMany = async (body: TIn[]): Promise<TOut[]> => {
    return await Promise.all(body.map(async body => await readOne(body)))
  }

  const read = async <M extends Read = Read.CREATE>(event: H3Event): Promise<M extends Read.CREATE ? TOut | TOut[] : Partial<Mutable<TOut>> | Partial<Mutable<TOut>>[]> => {
    const body = await readBody(event)
    return (!Array.isArray(body)
      ? await read.one(event)
      : await read.many(event)) as Promise<M extends Read.CREATE ? TOut | TOut[] : Partial<Mutable<TOut>> | Partial<Mutable<TOut>>[]>
  }

  read.one = async <M extends Read = Read.CREATE>(event: H3Event) => {
    const body = await readBody(event)
    if (Array.isArray(body)) {
      throw new TypeError(`Body must be of type object.`)
    }
    return readOne(body) as Promise<M extends Read.CREATE ? TOut : Partial<Mutable<TOut>>>
  }

  read.many = async <M extends Read = Read.CREATE>(event: H3Event) => {
    const body = await readBody(event)
    if (!Array.isArray(body)) {
      throw new TypeError(`Body must be of type array.`)
    }
    return readMany(body) as Promise<M extends Read.CREATE ? TOut[] : Partial<Mutable<TOut[]>>>
  }

  read.merge = <TInx extends TIn = TIn, TOutx extends TOut = TOut>(reader: (body: TInx) => TOutx | Promise<TOutx>) => {
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

export function defineEntityFormatter<E extends Entity = Entity, T = any>(formatter: (item: T) => Omit<EntityJSON<E>, `self`>) {
  const extensions: ((item: any) => any)[] = []
  const apply = (item: T) => {
    return extensions.reduce((formatted, extension) => ({
      ...formatted,
      ...extension(item),
    }), formatter(item))
  }

  const formatOne = (item: T, options?: Partial<FormatOptions<E>>): EntityJSON<E> => {
    const entity = Object
      .entries(apply(item))
      .filter(([_, value]) => (value !== undefined) || (options?.removeEmpty === false))
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}) as Omit<EntityJSON<E>, `self`>

    const self = options?.self ? options.self(entity) : getRequestURL(useEvent()).pathname
    return { self, ...entity } as EntityJSON<E>
  }

  const formatMany = (items: T[], options?: Partial<FormatManyOptions<E>>) => {
    const event = useEvent()
    const { pathname } = getRequestURL(event)

    const queryOptions = getQueryOptions(event)
    const self = options?.self?.list ?? pathname

    const canonicalSelf = options?.self?.canonical ?? ((entity: Omit<EntityJSON<E>, `self`>) => self.trim().split(`/`).concat(entity.id).join(`/`))
    const entities = items.map(item => formatOne(item, {
      self: canonicalSelf,
      removeEmpty: options?.removeEmpty,
    }))

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
  }

  function formatDiff(diffs: [Partial<T>, Partial<T>][], options?: Partial<Pick<FormatManyOptions<E>, `self`>>): EntityUpdateList<E>
  function formatDiff(before: Partial<T>, after: Partial<T>, options?: Pick<FormatOptions<E>, `self`>): EntityUpdate<E>
  function formatDiff(originalOrDiffs: Partial<T> | [Partial<T>, Partial<T>][], updatedOrListOptions?: Partial<T> | Partial<Pick<FormatManyOptions<E>, `self`>>, options?: Pick<FormatOptions<E>, `self`>): EntityUpdate<E> | EntityUpdateList<E> {
    if (Array.isArray(originalOrDiffs)) {
      const diffs = originalOrDiffs as [Partial<T>, Partial<T>][]
      const options = updatedOrListOptions as Partial<FormatManyOptions<E>>
      const beforeList = formatMany(diffs.map(([before, after]) => before as T), options)
      const afterList = formatMany(diffs.map(([before, after]) => after as T), options)
      const { entities, ...list } = beforeList
      return {
        ...list,
        entities: entities.map((before, i) => ({
          ...before,
          previous: afterList.entities[i],
        })),
      } as EntityUpdateList<E>
    } else {
      const before = originalOrDiffs as T
      const after = updatedOrListOptions as T
      return {
        ...formatOne(before as T, options),
        previous: formatOne(after as T, options) as Omit<EntityUpdate<E>, `previous`>,
      }
    }
  }

  const format = (items: T | T[], options?: Partial<typeof items extends T ? FormatOptions<E> : FormatManyOptions<E>>): typeof items extends T ? ReturnType<typeof formatOne> : ReturnType<typeof formatMany> => {
    return (Array.isArray(items)
      ? formatMany(items, options as Partial<FormatManyOptions<E>>)
      : formatOne(items, options as Partial<FormatOptions<E>>)) as typeof items extends T ? ReturnType<typeof formatOne> : ReturnType<typeof formatMany>
  }

  format.one = formatOne
  format.many = formatMany
  format.diff = formatDiff
  format.merge = <TIn extends T = T, EIn extends Entity = E>(formatter: (item: TIn) => Omit<EntityJSON<EIn>, keyof E>) => {
    extensions.push(formatter)
  }

  return format
}

export async function readEntityBody<E extends Entity = Entity>(event: H3Event, reader: (body: any, event: H3Event) => EntityJSONBody<E> | Promise<EntityJSONBody<E>>, options?: EntityBodyReaderOptions) {
  options = defu(options, { cardinality: Cardinality.MANY | Cardinality.ONE } as const)
  const body = await readBody(event)

  async function readOne(body: any) {
    return await reader(body, event)
  }

  async function readMany(body: any[]) {
    return await Promise.all(body.map(async body => await reader(body, event)))
  }

  switch (options.cardinality) {
    case Cardinality.ONE: {
      if (Array.isArray(body)) {
        throw new TypeError(`Body must be of type object.`)
      }
      return readOne(body)
    }
    case Cardinality.MANY: {
      if (!Array.isArray(body)) {
        throw new TypeError(`Body must be of type array.`)
      }
      return readMany(body)
    }
    case Cardinality.ONE | Cardinality.MANY:
    default: {
      return !Array.isArray(body) ? await readOne(body) : await readMany(body)
    }
  }
}

export function createContentOr404<T = any>(content?: T, options?: Partial<{ message: string }>) {
  return content ?? createError({ statusCode: 404, statusMessage: options?.message ? options.message : `The requested entity does not exist.` })
}
