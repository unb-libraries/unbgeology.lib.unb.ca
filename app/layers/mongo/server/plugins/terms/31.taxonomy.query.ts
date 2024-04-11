import { Date, ObjectID, String } from "../../utils/api/filter"
import { type Term } from "../../documentTypes/Term"

export default defineMongooseEventQueryHandler(Term, (event, query) => {
  const { filter, select, sort } = getQueryOptions(event)

  if (filter.length < 1 || select.length < 1 || filter.filter(([field]) => field.startsWith(`parent`)).length > 0 || select.filter(field => field.startsWith(`parent`)).length > 0) {
    query.join(`parent`, TaxonomyTerm)
    query.select(`parent`)
  }

  if (`sort` in query) {
    query.sort(...sort.map<[string, boolean]>(([field, asc]) => {
      if (field === `parent`) {
        return asc ? [`__l`, true] : [`__r`, false]
      }
      return [field, asc]
    }))
  }

  const filterableFields = [
    `type`,
    `parent.id`,
    `parent.label`,
    `parent.slug`,
    `parent.type`,
    `parent.created`,
    `parent.updated`,
  ]

  filter
    .filter(([field]) => filterableFields.includes(field))
    .forEach(([field, ...condition]) => {
      const [op, value] = condition
      if (field === `type` && (Array.isArray(value) ? value.includes(`taxonomy`) : value === `taxonomy`)) {
        return query.use(Array.isArray(value)
          ? String<Term>(field, [op, [TaxonomyTerm.fullName]])
          : String<Term>(field, [op, TaxonomyTerm.fullName]))
      } else if (field.startsWith(`parent`) && `where` in query) {
        query.where(`parent`).ex()
        switch (field.replace(`parent.`, ``)) {
          case `id`: query.use(ObjectID(`parent._id`, condition)); break
          case `label`:
          case `slug`: query.use(String(field, condition)); break
          case `created`:
          case `updated`: query.use(Date(field, condition))
        }
      }
    })
})
