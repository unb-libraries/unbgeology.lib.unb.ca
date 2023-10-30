import { type Person } from "entity-types/Affiliation"

export default defineEventHandler(async (event) => {
  const { select, sort, page, pageSize } = getQueryOptions(event)

  function getAffilationFields() {
    const fields = getSelectedFields(select, `affiliations`)
    return fields.length > 0 ? fields : [`_id`]
  }

  const people = await Person.find()
    .populate(`affiliations`, getAffilationFields())
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Person>(event, people, { total: await Person.countDocuments() })
})
