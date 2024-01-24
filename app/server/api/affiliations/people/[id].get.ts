import { type Person } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const person = await Person.findByPK(id)
    .populate(`image`)
  return sendEntityOr404<Person>(event, person)
})
