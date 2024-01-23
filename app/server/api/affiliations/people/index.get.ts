import { type Person } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const { sort, page, pageSize } = getQueryOptions(event)
  const people = await Person.find()
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Person>(event, people, { total: await Person.countDocuments() })
})
