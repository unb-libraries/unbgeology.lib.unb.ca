import { type Person } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readPersonBody(event)
  const person = await Person.findOneAndUpdate({ _id: id }, body, { new: true })
  return sendEntityOr404<Person>(event, person)
})
