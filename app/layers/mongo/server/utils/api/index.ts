import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { consola } from "consola"
import { defu } from "defu"
import { type H3Event } from "h3"
import { type QueryOptions, type Content, type Entity, type EntityList, type Payload, type DocumentQueryMethod, type DocumentQuery, type FilterableQuery, type DocumentPayload } from "../../../types/entity"
import { type DocumentBase, type DocumentModel } from "../../../types/schema"
import type { QueryCondition } from "./filter"
import type { PayloadReadOptions, PluginOptions, RenderOptions, RenderListOptions, RenderDocumentOptions, RenderDocumentListOptions } from "~/layers/mongo/types"

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

export function loadDocumentModel(Models: DocumentModel<any> | DocumentModel<any>[], options?: Partial<{ path: string | RegExp }>) {
  return defineEventHandler((event: H3Event) => {
    const { pathname } = getRequestURL(event)
    if ((options?.path && (typeof options.path === `string` ? pathname === options.path : options.path.test(pathname))) || !options?.path) {
      if (Array.isArray(Models)) {
        Models.forEach(m => consola.log(`${m.fullName} model loaded on ${pathname}`))
      } else {
        consola.log(`${Models.fullName} model loaded on ${pathname}`)
      }
    }
  })
}

export function defineMongooseEventQueryHandler<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = DocumentQueryMethod>(Model: DocumentModel<D>, handler: (event: H3Event, query: DocumentQuery<D, M>) => void | Promise<void>) {
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`mongoose:query:event`, async (query, context) => {
      const { event } = context
      const eventModel = getMongooseModel(event)
      if (eventModel && Model.fullName.startsWith(eventModel.fullName)) {
        await handler(event, query as DocumentQuery<D, M>)
      }
    })
  })
}

type QueryFieldDescriptor<D extends DocumentBase = DocumentBase> = {
  default: boolean
  join?: DocumentModel<any> | {
    documentType: DocumentModel<any>
    cardinality?: `one` | `many`
    localField?: string
  }
  select?: string | false
  sort?: string | false
  filter?: ((field: string, condition: QueryCondition) => (q: FilterableQuery<D>) => void) | false
  definition?: Record<string, QueryFieldDescriptor<D>>
}

export function defineEventQuery<D extends DocumentBase = DocumentBase, M extends DocumentQueryMethod = DocumentQueryMethod>(definition: Record<string, QueryFieldDescriptor<D>>) {
  return (event: H3Event, query: DocumentQuery<D, M>) => {
    const { select: selectedFields, filter: filterFields, sort: sortFields } = getQueryOptions(event)

    const doJoin = (id: string, field: QueryFieldDescriptor<D>) => {
      if (!field.join) { return }

      const join = {
        documentType: (`documentType` in field.join && field.join.documentType) || field.join as DocumentModel<any>,
        cardinality: (`cardinality` in field.join && field.join.cardinality) || `one`,
        localField: (`localField` in field.join && field.join.localField) || id,
      }

      const { localField, documentType, cardinality } = join
      query.join(localField, documentType, { cardinality })
    }

    const doFilter = (id: string, field: QueryFieldDescriptor<D>) => {
      const { filter, join } = field
      if (!filter) { return }

      if (filterFields.find(([field]) => field === id)) {
        const [, op, value] = filterFields.find(([field]) => field === id)!
        if (`where` in query) {
          query.use(filter(id, [op, value]))
          if (join) {
            doJoin(id, field)
          }
        }
      }
    }

    const getDescriptor = (id: string, root = definition): QueryFieldDescriptor<D> => {
      const [head, ...tail] = id.split(`.`)
      return tail.length > 0 ? getDescriptor(tail.join(`.`), root[head].definition) : root[head]
    }

    const doSelect = (id: string, field: QueryFieldDescriptor<D>) => {
      const { select = id, join } = field
      if (!select) { return }

      const isDefault = (id: string, options?: Partial<{ prefix: string, respectParents: boolean }>): boolean => {
        const { prefix, respectParents } = options || { prefix: ``, respectParents: true }

        const [head, ...tail] = id.split(`.`)
        const $default = getDescriptor(prefix ? `${prefix}.${head}` : head).default

        if (tail.length < 1) {
          return $default
        } else if (!respectParents || $default) {
          return isDefault(tail.join(`.`), { prefix: head })
        } else {
          return false
        }
      }

      const isSelected = (id: string): boolean => {
        const parentID = id.substring(0, id.lastIndexOf(`.`))
        return selectedFields.includes(id) ||
          (parentID && selectedFields.includes(parentID) && isDefault(id, { respectParents: false })) ||
          (selectedFields.length < 1 && isDefault(id))
      }

      if (isSelected(id)) {
        query.select(id)
        if (join) {
          doJoin(id, field)
        }
      }
    }

    const doSort = (id: string, field: QueryFieldDescriptor<D>) => {
      const { sort = id } = field
      if (`sort` in query && sort && (sortFields.find(([field]) => field === id))) {
        query.sort(sort)
      }
    }

    const traverse = (definition: Record<string, QueryFieldDescriptor<D>>, prefix: string = ``) => {
      Object.entries(definition).forEach(([key, field]) => {
        const id = prefix ? `${prefix}.${key}` : key
        doFilter(id, field)
        doSelect(id, field)
        doSort(id, field)
        if (field.definition) {
          traverse(field.definition, id)
        }
      })
    }

    traverse(definition)
  }
}

export function defineBodyReader<T extends object = object, P extends `create` | `update` = `create` | `update`, L = Payload<T, P>>(reader: (body: any, options: PayloadReadOptions<P>) => L | Promise<L>, options?: Partial<PluginOptions<typeof reader>>) {
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

export function defineMongooseReader<D extends DocumentBase, P extends `create` | `update`>(Model: DocumentModel<D>, reader: (body: any, options: PayloadReadOptions<P>) => DocumentPayload<Omit<D, keyof DocumentBase>, P> | Promise<DocumentPayload<Omit<D, keyof DocumentBase>, P>>, options?: Partial<PluginOptions<typeof reader>>) {
  const { enable, strict } = options || {}
  return defineBodyReader<Omit<D, keyof DocumentBase>, P, DocumentPayload<Omit<D, keyof DocumentBase>, P>>(reader, {
    enable: (body, options) => {
      const { event } = options
      const eventModel = getMongooseModel(event)
      return eventModel &&
        matchInputModel(Model, strict
          ? eventModel.fullName
          : new RegExp(`^${eventModel.fullName}`)) &&
        (!enable || enable(body, options))
    },
  })
}

export function matchInputModel<D extends DocumentBase>(Model: DocumentModel<D>, modelOrName: DocumentModel<any> | string | RegExp) {
  return typeof modelOrName === `object` && `fullName` in modelOrName
    ? Model.fullName === modelOrName.fullName
    : typeof modelOrName === `string`
      ? Model.fullName === modelOrName
      : modelOrName.test(Model.fullName)
}

export function matchInputType(input: any, type: string | RegExp, options?: { typeField: string}) {
  const typeField = options?.typeField ?? `type`
  return typeof type === `string` ? input[typeField] === type : type.test(input[typeField])
}

function flatten(body: object, prefix = ``, options?: { flattenArrays: boolean }): Record<string, any> {
  return Object.entries(body).reduce((flattened, [key, value]) => {
    if (typeof value === `object` && (options?.flattenArrays || !Array.isArray(value))) {
      return { ...flattened, ...flatten(value, `${prefix}${key}.`) }
    } else if (value !== undefined) {
      return { ...flattened, [`${prefix}${key}`]: value }
    } else {
      return flattened
    }
  }, {} as Record<string, any>)
}

async function readOr400<T extends object = object, P extends `create` | `update` = `create`>(event: H3Event, payload: any, options?: Partial<PayloadReadOptions<P>>): Promise<Payload<T, P> | Payload<T, P>[]> {
  const nitro = useNitroApp()
  const hookOptions: PayloadReadOptions<P> = {
    op: ([`POST`, `PUT`].includes(event.method) ? `create` : `update`) as P,
    flat: false,
    flattenArrays: false,
    event,
    ...options,
  }

  try {
    const hookResults = await nitro.hooks.callHookParallel(`body:read`, payload, hookOptions)
    const body = hookResults.reduce((body, input) => {
      const definedInputEntries = Object.entries(input).filter(([, value]) => value !== undefined)
      return { ...body, ...Object.fromEntries(definedInputEntries) }
    }, {})
    return hookOptions.flat ? flatten(body) : body
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

export function defineEntityFormatter<T = any, C extends Content = Content, O extends RenderOptions = RenderOptions>(formatter: (item: T, options: O) => Partial<C> | Promise<Partial<C> | void> | void) {
  return defineNitroPlugin((nitro) => {
    nitro.hooks.hook(`entity:render`, (item: T, options) => {
      const formatted = formatter(item, options as O)
      if (formatted) {
        return formatted
      }
      return {}
    })
  })
}

export function defineMongooseFormatter<D extends DocumentBase, T extends Content>(Model: DocumentModel<D>, formatter: (doc: D, options: RenderDocumentOptions<D>) => Partial<T> | Promise<Partial<T> | void> | void, options?: Partial<PluginOptions<typeof formatter>>) {
  const { strict } = options || {}
  return defineEntityFormatter<D, T, RenderDocumentOptions<D>>((doc, options) => {
    const modelName = options.model?.fullName
    if ((strict && modelName === Model.fullName) || Model.fullName.match(RegExp(`^${modelName}`))) {
      return formatter(doc, options)
    }
  })
}

const uriFromEventPathname = <D extends object = object>(data: D) => {
  const event = useEvent()
  if (event) {
    return getRequestURL(event).pathname
  }
  return ``
}

export async function render<C extends Content = Content, D extends object = object>(data: D, options?: Partial<RenderOptions<D>>): Promise<Entity<C>> {
  const nitro = useNitroApp()
  const renderOptions: RenderOptions<D> = defu(options, {
    self: uriFromEventPathname<D>,
  })

  const formattedContent = await nitro.hooks.callHookParallel(`entity:render`, data, renderOptions)
  const self = renderOptions.self(data)

  const entity = Object
    .entries(formattedContent.reduce((content, formatted) => ({ ...content, ...formatted }), {}))
    .filter(([_, value]) => (value !== undefined))
    .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {}) as Omit<Entity<C>, `self`>

  return { self, ...entity } as Entity<C>
}

export async function renderOr404<C extends Content = Content, D extends object = object>(data?: D, options?: Partial<RenderOptions<D> & { message: string }>) {
  if (data) {
    return await render<C, D>(data, options)
  }
  return create404(options?.message)
}

export async function renderList<C extends Content = Content, D extends object = object>(data: D[], options?: Partial<RenderListOptions<D> & { renderFn?: typeof render }>): Promise<EntityList<C>> {
  const event = useEvent()
  const queryOptions = event ? getQueryOptions(event) : { page: 1, pageSize: 25 }

  const renderOptions = defu(options, {
    canonical: {
      self: (data: D) => {
        if (`id` in data) {
          return uriFromEventPathname(data).trim().split(`/`).concat(`${data.id}`).join(`/`)
        }
        return uriFromEventPathname(data)
      },
    },
    self: uriFromEventPathname<D[]>,
    total: data.length,
    page: queryOptions.page,
    pageSize: queryOptions.pageSize,
    renderFn: render,
  })

  const entities = await Promise.all(data.map(async (item: any) => await renderOptions.renderFn<C, D>(item, renderOptions.canonical)))
  const { total, page, pageSize } = renderOptions
  const paginator = usePaginator({ total, page, pageSize })

  return {
    self: renderOptions.self(data),
    entities,
    ...paginator,
  }
}

export function diff<T extends object = object>(obj: T, clone: T, options?: { keep: (keyof T)[] }): [Partial<T>, Partial<T>] {
  const diffs: [keyof T, [T[keyof T], T[keyof T]]][] = Object.entries(obj)
    .filter(([path, value]) => options?.keep?.includes(path as keyof T) || JSON.stringify(value) !== JSON.stringify(clone[path as keyof T]))
    .map(([path, value]) => [path, typeof value !== `object` || Array.isArray(value)
      ? [value, clone[path as keyof T]]
      : diff(value as object, clone[path as keyof T] as object)]) as [keyof T, [T[keyof T], T[keyof T]]][]

  return [
    Object.fromEntries(diffs.map(([path, diffs]) => [path, diffs[0]])) as Partial<T>,
    Object.fromEntries(diffs.map(([path, diffs]) => [path, diffs[1]])) as Partial<T>,
  ]
}

export async function renderDiffOr404<C extends Content = Content, D extends object = object>(data?: [D, D], options?: Partial<RenderOptions<D> & { message: string }>) {
  if (data) {
    return await renderDiff<C, D>(data, options)
  }
  return create404(options?.message)
}

export async function renderDiff<C extends Content = Content, D extends object = object>(data: [D, D], options?: Partial<RenderOptions<D>>): Promise<Entity<Partial<C>>> {
  const rendered = await Promise.all(data.map(d => render<C, D>(d, options)))

  const [before, after] = rendered
  const [diffBefore, diffAfter] = diff(before, after).map((d, index) => ({
    ...d,
    id: rendered[index].id,
    self: rendered[index].self,
  }))

  return {
    previous: diffBefore,
    ...diffAfter,
  }
}

export async function renderDiffList<C extends Content = Content, D extends object = object>(data: [D, D][], options?: Partial<RenderListOptions<D>>): Promise<EntityList<Partial<C>>> {
  const beforeData = data.map(([before]) => before)
  const afterData = data.map(([, after]) => after)
  const [beforeList, afterList] = await Promise.all([beforeData, afterData].map(async data => await renderList<C, D>(data, options)))

  const { entities: beforeEntities, ...list } = beforeList
  const { entities: afterEntities } = afterList
  const diffs = beforeEntities
    .map((before, index) => [before, afterEntities[index]])
    .map((rendered) => {
      const [before, after] = rendered
      const [diffBefore, diffAfter] = diff(before, after).map((d, index) => ({
        ...d,
        id: rendered[index].id,
        self: rendered[index].self,
      }))

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

export async function renderDocument<C extends Content = Content, D extends DocumentBase = DocumentBase>(doc: D, options?: Partial<RenderDocumentOptions<D>>): Promise<Entity<C>> {
  return await render<C, D>(doc, options)
}
export async function renderDocumentOr404<C extends Content = Content, D extends DocumentBase = DocumentBase>(doc?: D, options?: Partial<RenderDocumentOptions<D> & { message: string }>) {
  return await renderOr404<C, D>(doc, options)
}
export async function renderDocumentList<C extends Content = Content, D extends DocumentBase = DocumentBase>(docs: D[], options?: Partial<RenderDocumentListOptions<D>>): Promise<EntityList<C>> {
  return await renderList<C, D>(docs, defu(options, {
    canonical: {
      self: (doc: D) => uriFromEventPathname(doc).trim().concat(`/${doc._id}`),
      renderFn: renderDocument,
      model: options?.model,
    },
  }))
}
export async function renderDocumentDiff<C extends Content = Content, D extends DocumentBase = DocumentBase>(docs: [D, D], options?: Partial<RenderDocumentOptions<D>>): Promise<Entity<Partial<C>>> {
  return await renderDiff<C, D>(docs, options)
}
export async function renderDocumentDiffOr404<C extends Content = Content, D extends DocumentBase = DocumentBase>(docs?: [D, D], options?: Partial<RenderDocumentOptions<D> & { message: string }>) {
  return await renderDiffOr404<C, D>(docs, options)
}
export async function renderDocumentDiffList<C extends Content = Content, D extends DocumentBase = DocumentBase>(docs: [D, D][], options?: Partial<RenderDocumentListOptions<D>>): Promise<EntityList<Partial<C>>> {
  return await renderDiffList<C, D>(docs, defu(options, {
    canonical: {
      self: (doc: D) => uriFromEventPathname(doc).trim().concat(`/${doc._id}`),
      renderFn: renderDocumentDiff,
      model: options?.model,
    },
  }))
}

export function create404(message?: string) {
  if (message) {
    return createError({ statusCode: 404, statusMessage: message })
  }

  const event = useEvent()
  if (event) {
    const params = Object.entries(getRouterParams(event))
    if (params.length > 0) {
      const [param, value] = params.at(-1)!
      return createError({ statusCode: 404, statusMessage: `The resource with ${param} "${value}" does not exist.` })
    }
  }
  return createError({ statusCode: 404, statusMessage: `The resource does not exist.` })
}
