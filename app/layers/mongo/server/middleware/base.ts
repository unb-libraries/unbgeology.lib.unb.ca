import { FileState } from "@unb-libraries/nuxt-layer-entity"
import { Date, Numeric, ObjectID, String } from "../utils/api/filter"

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.startsWith(`/api/files`)) {
    const { select, sort, filter } = getQueryOptions(event)
    const defaultFields = [
      `id`,
      `filesize`,
      `mimetype`,
      `uri`,
      `status`,
      `type`,
      `created`,
      `updated`,
    ]

    const project = (field: string) => {
      switch (field) {
        case `id`: return `_id`
        case `uri`: return `filename`
        default: return field
      }
    }

    addMongooseField(event, ...(select.length > 0
      ? select.filter(field => defaultFields.includes(field)).map(project)
      : defaultFields.map(project)))

    if (sort.length > 0) {
      addMongooseSortField(event, ...sort.filter(([field]) => defaultFields.includes(field)))
    }

    filter.forEach(([field, ...condition]) => {
      const [op, value] = condition
      switch (field) {
        case `id`: addMongooseFilter(event, ObjectID(`_id`, condition)); break
        case `filesize`: addMongooseFilter(event, Numeric(field, condition)); break
        case `mimetype`: addMongooseFilter(event, String(field, condition)); break
        case `status`: addMongooseFilter(event, Numeric.Equals(field, [op, Array.isArray(value)
          ? value.map(v => `${useEnum(FileState).valueOf(v as unknown as FileState)}`)
          : `${useEnum(FileState).valueOf(value as unknown as FileState)}`])); break
        case `created`:
        case `updated`: addMongooseFilter(event, Date(field, condition)); break
      }
    })
  }
})
