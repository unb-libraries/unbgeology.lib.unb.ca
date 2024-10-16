import { Date, ObjectID, String } from "../../utils/api/filter"

export default defineMongooseEventQueryHandler(Term, (event, query) => {
  const { filter, select, sort } = getQueryOptions(event)
  const defaultFields = [
    `label`,
    `slug`,
    `type`,
    `created`,
    `updated`,
  ]

  const project = (field: string) => field === `type` ? `__type` : field
  query.select(`_id`, ...(select.length > 0
    ? select.filter(field => defaultFields.includes(field)).map(project)
    : defaultFields.map(project)))

  if (`sort` in query) {
    query.sort?.(...sort.filter(([field]) => defaultFields.includes(field)))
  }

  filter
    .filter(([field]) => [`id`, ...defaultFields].includes(field))
    .forEach(([field, ...condition]) => {
      const [, value] = condition
      switch (field) {
        case `id`: query.use(ObjectID(`_id`, condition)); break
        case `label`:
        case `slug`: query.use(String(field, condition)); break
        case `type`:
          if ((Array.isArray(value) && value.includes(`term`)) || value === `term`) {
            if (`expr` in query) {
              query.expr({ [field]: { $exists: 0 } })
            }
            break
          }; break
        case `created`:
        case `updated`: query.use(Date(field, condition))
      }
    })
})
