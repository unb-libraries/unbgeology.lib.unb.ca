import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { type H3Event } from "h3"
import { type QueryOptions, type Content, type Entity, type EntityList, type Payload, type DocumentQueryMethod, type DocumentQuery } from "../../../types/entity"
import { type FormatOptions, type FormatManyOptions } from "../../../types/api"
import { type DocumentBase, type DocumentModel } from "../../../types/schema"
import type { RenderOptions, PayloadReadOptions, PluginOptions } from "~/layers/mongo/types"

function initMongooseContext(event: H3Event) {
  event.context.mongoose = {
    model: undefined,
  }
}

export function setModel(event: H3Event, model: DocumentModel<any>) {
  if (!event.context.mongoose) {
    initMongooseContext(event)
  }
  event.context.mongoose.model = model
}

export function getMongooseModel<D extends DocumentBase = DocumentBase>(event: H3Event): DocumentModel<D> {
  return event.context.mongoose?.model
}

export function getEntityQueryOptions(event: H3Event) {
  if (!event.context.query) {
    event.context.query = {
      filter: true,
      select: true,
      sort: true,
    }
  }
  return event.context.query
}

export function setEntityQueryOptions(event: H3Event, options: Partial<{ filter: boolean, select: boolean, sort: boolean }>) {
  const queryOptions = getEntityQueryOptions(event)
  event.context.query = {
    ...queryOptions,
    ...options,
  }
}

export function getQueryOptions(event: H3Event): QueryOptions {
  const queryOptions = getEntityQueryOptions(event)
  const { filter, select, sort, search, ...query } = getQuery(event)
  let { page, pageSize } = query

  pageSize = pageSize ? Array.isArray(pageSize) ? parseInt(`${pageSize.at(-1)}`) : parseInt(`${pageSize}`) : 25
  pageSize = Math.min(Math.max(1, pageSize), 100)

  page = page ? Array.isArray(page) ? parseInt(`${page.at(-1)}`) : parseInt(`${page}`) : 1
  page = Math.max(1, page)

  return {
    page,
    pageSize,
    select: queryOptions.select && select ? Array.isArray(select) ? select : [select] : [],
    filter: queryOptions.filter && filter
      ? Object.entries((Array.isArray(filter) ? filter : [filter])
        .map<string[3]>(f => f.split(`:`))
        .map<[string, number, string]>(([field, op, value]) => [field, !isNaN(parseInt(op)) ? parseInt(op) : useEnum(FilterOperator).valueOf(op as unknown as FilterOperator), value])
        .reduce((obj, [field, newOp, newValue]) => {
          if (!obj[field]) {
            obj[field] = [newOp, newValue]
          } else {
            const [op, value] = obj[field]
            obj[field] = [op | newOp, newValue ? Array.isArray(value) ? [...value, newValue] : [value, newValue] : value]
          }
          return obj
        }, {} as Record<string, [number, string | string[]]>))
        .map(([field, [op, value]]) => [field, op, value])
      : [],
    search: Array.isArray(search) ? search.at(-1) : search,
    sort: queryOptions.sort && sort ? (Array.isArray(sort) ? sort : [sort]).map(field => field.startsWith(`-`) ? [field.substring(1), false] : [field, true]) : [],
  }
}

export function defineMongooseEventQueryHandler<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = DocumentQueryMethod>(Model: DocumentModel<D>, handler: (event: H3Event, query: DocumentQuery<D, M>) => void | Promise<void>) {
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`mongoose:query:event`, async (query, context) => {
      const { event } = context
      const eventModel = getMongooseModel(event)
      if (eventModel && Model.fullName.startsWith(eventModel.fullName)) {
        return await handler(event, query as DocumentQuery<D, M>)
      }
    })
  })
}

export function defineBodyReader<T extends object = object, P extends `create` | `update` = `create` | `update`>(reader: (body: any, options: PayloadReadOptions<P>) => Payload<T, P> | Promise<Payload<T, P>>, options?: Partial<PluginOptions<typeof reader>>) {
  const enable = options?.enable
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`body:read`, async (body, options) => {
      if (!enable || enable(body, options as PayloadReadOptions<P>)) {
        return await reader(body, options as PayloadReadOptions<P>)
      }
      return {}
    })
  })
}

export function defineMongooseReader<D extends DocumentBase, P extends `create` | `update`>(Model: DocumentModel<D>, reader: (body: any, options: PayloadReadOptions<P>) => Payload<Omit<D, keyof DocumentBase>, P> | Promise<Payload<Omit<D, keyof DocumentBase>, P>>, options?: Partial<PluginOptions<typeof reader>>) {
  const { enable, strict } = options || {}
  return defineBodyReader<Omit<D, keyof DocumentBase>, P>(reader, {
    enable: (body, options) => {
      const eventModel = getMongooseModel(options.event)
      return eventModel && matchInputModel(Model, strict ? eventModel.fullName : new RegExp(`^${eventModel.fullName}`)) && (!enable || enable(body, options))
    },
    ...options,
  })
}

export function matchInputModel<D extends DocumentBase>(Model: DocumentModel<D>, modelOrName: DocumentModel<any> | string | RegExp) {
  return typeof modelOrName === `object` && `fullName` in modelOrName
    ? Model.fullName === modelOrName.fullName
    : typeof modelOrName === `string`
      ? Model.fullName === modelOrName
      : modelOrName.test(Model.fullName)
}

export function matchInputType(input: any, type: string | RegExp) {
  return typeof type === `string` ? input.type === type : type.test(input.type)
}

async function readOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event, payload: any, options?: Partial<PayloadReadOptions<P>>): Promise<Payload<T, P> | Payload<T, P>[]> {
  const nitro = useNitroApp()
  try {
    const bodies = await nitro.hooks.callHookParallel(`body:read`, payload, {
      op: `create`,
      event,
      ...options,
    })
    return bodies.reduce((body, input) => ({ ...body, ...input }), {})
  } catch (err) {
    throw createError({ statusCode: 400, statusMessage: `Invalid payload: ${(err as Error).message}` })
  }
}

export async function readBodyOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event, options?: Partial<PayloadReadOptions<P>>): Promise<Payload<T, P> | Payload<T, P>[]> {
  const payload = await readBody(event)
  if (Array.isArray(payload)) {
    return await readBodyListOr400<T, P>(event, options)
  }
  return await readOneBodyOr400<T, P>(event, options)
}

export async function readOneBodyOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event, options?: Partial<PayloadReadOptions<P>>): Promise<Payload<T, P>> {
  const payload = await readBody(event)
  if (Array.isArray(payload)) {
    throw new TypeError(`Body must be of type object.`)
  }
  return await readOr400<T, P>(event, payload, options) as T
}

export async function readBodyListOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event, options?: Partial<PayloadReadOptions<P>>): Promise<Payload<T, P>[]> {
  const payloads = await readBody<T[]>(event)
  if (!Array.isArray(payloads)) {
    throw new TypeError(`Body must be of type array.`)
  }
  return await Promise.all(payloads.map(payload => readOr400<T, P>(event, payload, options))) as T[]
}

export function defineEntityFormatter<T = any, C extends Content = Content>(formatter: (item: T, options: RenderOptions) => Partial<C> | Promise<Partial<C>>, options?: Partial<PluginOptions<typeof formatter>>) {
  const enable = options?.enable
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`entity:render`, (item: T, options) => {
      if (!enable || enable(item, options)) {
        return formatter(item, options)
      }
      return {}
    })
  })
}

export function defineMongooseFormatter<D extends DocumentBase, T extends Content>(Model: DocumentModel<D>, formatter: (doc: D, options: RenderOptions) => Partial<T> | Promise<Partial<T>>, options?: Partial<PluginOptions<typeof formatter>>) {
  const { enable } = options || {}
  return defineEntityFormatter<D, T>(formatter, {
    enable: (doc, options) => {
      const eventModel = getMongooseModel(options.event)
      return eventModel && matchInputType(doc, new RegExp(`^${Model.fullName}`)) && (!enable || enable(doc, options))
    },
    ...options,
  })
}

export async function render<C extends Content = Content, D = any>(event: H3Event, data: D, options?: Partial<FormatOptions<C>>): Promise<Entity<C>> {
  const nitro = useNitroApp()
  const formattedContent = await nitro.hooks.callHookParallel(`entity:render`, data, { event })
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
  return create404(event)
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
  return create404(event)
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

export function create404(event: H3Event, message?: string) {
  const params = Object.entries(getRouterParams(event))
  if (params.length > 0) {
    const [param, value] = params.at(-1)!
    return createError({ statusCode: 404, statusMessage: message ?? `The resource with ${param} "${value}" does not exist.` })
  }
  return createError({ statusCode: 404, statusMessage: message ?? `The resource does not exist.` })
}
