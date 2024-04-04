import { FileState } from "@unb-libraries/nuxt-layer-entity"
import { Date, Numeric, ObjectID, String } from "../../utils/api/filter"

export default defineMongooseMiddleware(FileBase, (event, query) => {
  const { select, sort, filter } = getQueryOptions(event)
  const defaultFields = [
    `filesize`,
    `mimetype`,
    `uri`,
    `status`,
    `type`,
    `created`,
    `updated`,
  ]

  const project = (field: string) => field === `uri` ? `filename` : field
  query.select(`_id`, ...(select.length > 0
    ? select
      .filter(field => defaultFields.includes(field))
      .map(project)
    : defaultFields.map(project)))

  query.sort(...sort.filter(([field]) => defaultFields.includes(field)))

  filter
    .filter(([field]) => [`id`, ...defaultFields].includes(field))
    .forEach(([field, ...condition]) => {
      const [op, value] = condition
      switch (field) {
        case `id`: query.use(ObjectID(`_id`, condition)); break
        case `filesize`: query.use(Numeric(field, condition)); break
        case `mimetype`: query.use(String(field, condition)); break
        case `status`: query.use(Numeric.Equals(field, [op, Array.isArray(value)
          ? value.map(v => `${useEnum(FileState).valueOf(v as unknown as FileState)}`)
          : `${useEnum(FileState).valueOf(value as unknown as FileState)}`])); break
        case `created`:
        case `updated`: query.use(Date(field, condition)); break
      }
    })
})
