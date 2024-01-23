import { type Person } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const body = await readPersonBody(event)
  const person = await Person.create(body)
  return sendEntity<Person>(event, person)
})
