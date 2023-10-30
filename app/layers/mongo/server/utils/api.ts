import { type Document, type Types } from "mongoose"
import { type H3Event } from "h3"
import { type QueryOptions, type Entity, type EntityJSON, type EntityListOptions } from "~/layers/mongo/types/entity"

export function getSelectedFields(fields: string[], prefix?: string) {
  if (prefix) {
    return fields.filter(f => f.startsWith(prefix)).map(f => f.split(`.`)[1])
  }
  return fields.map(f => f.split(`.`)[0])
}

export function getQueryOptions(event: H3Event): QueryOptions {
  const { select, sort, ...query } = getQuery(event)
  let { page, pageSize } = query

  pageSize = pageSize ? Array.isArray(pageSize) ? parseInt(`${pageSize.at(-1)}`) : parseInt(`${pageSize}`) : 25
  pageSize = Math.min(Math.max(1, pageSize), 100)

  page = page ? Array.isArray(page) ? parseInt(`${page.at(-1)}`) : parseInt(`${page}`) : 1
  page = Math.max(1, page)

  const selection = select ? Array.isArray(select) ? select : [select] : []

  return {
    page,
    pageSize,
    select: selection,
    filterSelect({ root, prefix, default: defaultFields }) {
      const fields = defaultFields ?? []
      if (root) {
        fields.push(...selection.filter(f => f.startsWith(root)).map(f => f.split(`.`)[1]))
      } else {
        fields.push(...selection.map(f => f.split(`.`)[0]))
      }
      return prefix ? fields.map(f => `${prefix}.${f}`) : fields
    },
    sort: sort ? Array.isArray(sort) ? sort : [sort] : [],
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
