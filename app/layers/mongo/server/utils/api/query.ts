import { FilterOperator, type MigrationItem, MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"
import { type H3Event } from "h3"

interface MigrationItemDocumentQuery {
  filter: Record<keyof MigrationItem, any>
  select: (keyof MigrationItem)[]
  sort: [keyof MigrationItem, boolean][]
  page: number
  pageSize: number
}

export function getMigrationItemsDocumentQuery(event: H3Event): MigrationItemDocumentQuery {
  const { filter, select, sort, ...query } = getQueryOptions(event)

  const fields: (keyof MigrationItem)[] = [
    `id`,
    `entityURI`,
    `data`,
    `queue`,
    `error`,
    `status`,
  ]

  return {
    ...query,
    filter: Object.fromEntries(Object.entries({
      id: (op: FilterOperator, v: string | string[]) => op & FilterOperator.EQUALS && {
        sourceID: { $in: Array.isArray(v) ? v : [v] },
      },
      entityURI: (op: FilterOperator, v: string | string[]) => op & FilterOperator.MATCH && {
        entityURI: { $regex: Array.isArray(v) ? new RegExp(v.join(`|`)) : new RegExp(v) },
      },
      queue: (op: FilterOperator, v: string | string[]) => op & FilterOperator.EQUALS && {
        queue: { $in: Array.isArray(v) ? v : [v] },
      },
      error: (op: FilterOperator, v: string | string[]) => op & FilterOperator.MATCH && {
        error: { $regex: Array.isArray(v) ? new RegExp(v.join(`|`)) : new RegExp(v) },
      },
      status: (op: FilterOperator, v: string | string[]) => op & FilterOperator.EQUALS && {
        status: Array.isArray(v)
        // @ts-ignore
          ? useEnum(MigrationItemStatus).valueOf(v.reduce((acc, s) => acc | useEnum(MigrationItemStatus).valueOf(s), 0))
        // @ts-ignore
          : useEnum(MigrationItemStatus).valueOf(v),
      },
    }).map(([field, fn]) => {
      const [, op, value] = filter.find(([f]) => f === field) ?? []
      return [field, op && value && fn(op, value)]
    }).filter(([, condition]) => condition)),
    select: (select as (keyof MigrationItem)[]).filter(([field]) => fields.includes(field as keyof MigrationItem)),
    sort: (sort as [keyof MigrationItem, boolean][]).filter(([field]) => fields.includes(field as keyof MigrationItem)),
  }
}
