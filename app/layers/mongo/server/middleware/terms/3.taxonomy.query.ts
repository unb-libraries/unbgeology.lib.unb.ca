import { String } from "../../utils/api/filter"
import { type Term } from "../../documentTypes/Term"

export default defineMongooseMiddleware(Term, (event, query) => {
  const { filter, select, sort } = getQueryOptions(event)

  if (select.length < 1 || select.filter(field => field.startsWith(`parent`)).length > 0) {
    query.select(`parent`)
  }

  query.sort(...sort.map<[string, boolean]>(([field, asc]) => {
    if (field === `parent`) {
      return asc ? [`__l`, true] : [`__r`, false]
    }
    return [field, asc]
  }))

  query.use(...filter
    .filter(([field]) => field === `type`)
    .filter(([,, value]) => Array.isArray(value) ? value.includes(`taxonomy`) : value === `taxonomy`)
    .map(([field, op, value]) => {
      return Array.isArray(value)
        ? String<Term>(field, [op, [TaxonomyTerm.fullName]])
        : String<Term>(field, [op, TaxonomyTerm.fullName])
    }))
})
