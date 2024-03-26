import { type H3Event } from "h3"
import { type EntityJSON, FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type QueryOptions, type DocumentQuery, type Content, type Entity, type EntityList, type Payload } from "../../../types/entity"
import { type FormatOptions, type FormatManyOptions } from "../../../types/api"
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

export function getMongooseMiddleware<D extends DocumentBase = DocumentBase>(event: H3Event): ((query: DocumentQuery<D>) => void)[] {
  return event.context.mongoose?.handlers ?? []
}

export function defineMongooseMiddleware<D extends DocumentBase = DocumentBase>(Model: DocumentModel<D>, handler: (event: H3Event, query: DocumentQuery<D>) => void) {
  return defineEventHandler((event) => {
    if (getMongooseModel(event)?.mongoose.model.modelName === Model.mongoose.model.modelName) {
      if (!event.context.mongoose.handlers) {
        event.context.mongoose.handlers = []
      }
      event.context.mongoose.handlers.push((query: DocumentQuery<D>) => handler(event, query))
    }
  })
}
}

export function defineBodyReader<T extends object = object>(Model: DocumentModel<any>, transformer: (body: any) => Payload<T> | Promise<Payload<T>>) {
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`body:transform`, async (payload, options) => {
      if (Model.mongoose.model.modelName === options.modelName) {
        return await transformer(payload)
      }
      return {}
    })
  })
}

async function transformOr400<T extends object = object, P extends `create` | `update` = `create`>(modelName:string, payload: any): Promise<Payload<T, P> | Payload<T, P>[]> {
  const nitro = useNitroApp()
  try {
    const bodies = await nitro.hooks.callHookParallel(`body:transform`, payload, {
      modelName,
    })
    return bodies.reduce((body, input) => ({ ...body, ...input }), {})
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: `Invalid payload: ${(err as Error).message}` })
  }
}

export async function readBodyOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event): Promise<Payload<T, P> | Payload<T, P>[]> {
  const payload = await readBody(event)
  if (Array.isArray(payload)) {
    return await readBodyListOr400<T>(event)
  }
  return await readOneBodyOr400<T>(event)
}

export async function readOneBodyOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event): Promise<Payload<T, P>> {
  const payload = await readBody(event)
  if (Array.isArray(payload)) {
    throw new TypeError(`Body must be of type object.`)
  }
  return await readOr400<T, P>(getMongooseModel(event).mongoose.model.modelName, payload) as T
}

export async function readBodyListOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event): Promise<Payload<T, P>[]> {
  const payloads = await readBody<T[]>(event)
  if (!Array.isArray(payloads)) {
    throw new TypeError(`Body must be of type array.`)
  }
  const modelName = getMongooseModel(event).name
  return await Promise.all(payloads.map(payload => transformOr400(modelName, payload))) as T[]
}

export function defineEntityFormatter<E extends Entity = Entity, T = any>(Model: DocumentModel<any>, formatter: (item: T) => Omit<EntityJSON<E>, `self`>) {
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`document:format`, (item: T, options) => {
      if (Model.mongoose.model.modelName === options.modelName) {
        return formatter(item)
      }
      return {}
    })
  })
}

export async function render<C extends Content = Content, D = any>(event: H3Event, data: D, options?: Partial<FormatOptions<C>>): Promise<Entity<C>> {
  const nitro = useNitroApp()
  const formattedContent = await nitro.hooks.callHookParallel(`document:format`, data, { modelName: getMongooseModel(event)?.mongoose.model.modelName })
  const entity = Object
    .entries(formattedContent.reduce((content, formatted) => ({ ...content, ...formatted }), {}))
    .filter(([_, value]) => (value !== undefined))
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}) as Omit<Entity<C>, `self`>
  const self = options?.self ? options.self(entity) : getRequestURL(event).pathname
  return { self, ...entity } as Entity<C>
}

export async function renderOr404<C extends Content = Content, D = any>(event: H3Event, data?: D, options?: Partial<FormatOptions<C> & { message: string }>) {
  if (data) {
    return await render(event, data, options)
  }
  return createError({ statusCode: 404, statusMessage: options?.message ? options.message : `The requested entity does not exist.` })
}

export async function renderList<C extends Content = Content, D = any>(event: H3Event, data: D[], options?: Partial<FormatManyOptions<C> & { format?: typeof render }>): Promise<EntityList<C>> {
  const { pathname } = getRequestURL(event)

  const queryOptions = getQueryOptions(event)
  const self = options?.self?.list ?? pathname

  const canonicalSelf = options?.self?.canonical ?? ((entity: Omit<Entity<C>, `self`>) => self.trim().split(`/`).concat(entity.id).join(`/`))
  const formatOptions = { self: canonicalSelf }
  const entities = await Promise.all(data.map(async (item: any) => options?.format?.(event, item, formatOptions) ?? await render(event, item, formatOptions)))

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

export function diff<T extends object = object>(obj: T, clone: T, options?: { keep: (keyof T)[] }): [Partial<T>, Partial<T>] {
  const diffs: [keyof T, [T[keyof T], T[keyof T]]][] = Object.entries(obj)
    .filter(([path, value]) => options?.keep?.includes(path as keyof T) || JSON.stringify(value) !== JSON.stringify(clone[path as keyof T]))
    .map(([path, value]) => [path, typeof value !== `object`
      ? [value, clone[path as keyof T]]
      : diff(value as object, clone[path as keyof T] as object)]) as [keyof T, [T[keyof T], T[keyof T]]][]

  return [
    Object.fromEntries(diffs.map(([path, diffs]) => [path, diffs[0]])) as Partial<T>,
    Object.fromEntries(diffs.map(([path, diffs]) => [path, diffs[1]])) as Partial<T>,
  ]
}

export async function renderDiffOr404<C extends Content = Content, D = any>(event: H3Event, data?: [D, D], options?: Partial<FormatOptions<C> & { message: string }>) {
  if (data) {
    return await renderDiff<C>(event, data, options)
  }
  return createError({ statusCode: 404, statusMessage: options?.message ? options.message : `The requested entity does not exist.` })
}

export async function renderDiff<C extends Content = Content, D = any>(event: H3Event, data: [D, D], options?: Partial<FormatOptions<C>>): Promise<Entity<Partial<C>>> {
  const [before, after] = await Promise.all(data.map(d => render(event, d, options)))
  const [diffBefore, diffAfter] = diff(before, after, { keep: [`id`, `self`] }) as [Entity<Partial<C>>, Entity<Partial<C>>]
  return {
    previous: diffBefore,
    ...diffAfter,
  }
}

export async function renderDiffList<C extends Content = Content, D = any>(event: H3Event, data: [D, D][], options?: Partial<FormatManyOptions<C>>): Promise<EntityList<Partial<C>>> {
  const beforeData = data.map(([before]) => before)
  const afterData = data.map(([, after]) => after)
  const [beforeList, afterList] = await Promise.all([beforeData, afterData].map(async data => await renderList(event, data, options)))

  const { entities: beforeEntities, ...list } = beforeList
  const { entities: afterEntities } = afterList
  const diffs = beforeEntities
    .map((before, index) => [before, afterEntities[index]])
    .map(([before, after]) => {
      const [diffBefore, diffAfter] = diff(before, after, { keep: [`id`, `self`] }) as [Entity<Partial<C>>, Entity<Partial<C>>]
      return {
        previous: diffBefore,
        ...diffAfter,
      }
    })

  return {
    ...list,
    entities: diffs,
  }
}
