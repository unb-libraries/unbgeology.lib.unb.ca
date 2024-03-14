import { Date, ObjectID, String } from "../utils/api/filter"

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  if (pathname.startsWith(`/api/terms`)) {
    const { select, sort, filter } = getQueryOptions(event)
    const defaultFields = [
      `id`,
      `label`,
      `slug`,
      `type`,
      `created`,
      `updated`,
    ]

    const project = (field: string) => field === `id` ? `_id` : field
    addMongooseField(event, ...(select.length > 0
      ? select.filter(field => defaultFields.includes(field)).map(project)
      : defaultFields.map(project)))

    if (sort.length > 0) {
      addMongooseSortField(event, ...sort.filter(([field]) => defaultFields.includes(field)))
    }

    filter.forEach(([field, ...condition]) => {
      switch (field) {
        case `id`: addMongooseFilter(event, ObjectID(`_id`, condition)); break
        case `label`:
        case `slug`: addMongooseFilter(event, String(field, condition)); break
        case `created`:
        case `updated`: addMongooseFilter(event, Date(field, condition)); break
      }
    })
  }
})
