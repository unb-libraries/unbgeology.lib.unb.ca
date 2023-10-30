import { type Person } from "entity-types/Affiliation"

export default defineEventHandler(async (event) => {
  const { affiliations: affiliationURIs, ...body } = await readBody(event)
  if (affiliationURIs) {
    body.affiliations = await Organization.findManyByURI(affiliationURIs)
  }

  const person = await Person.create(body)
  return sendEntity<Person>(event, person)
})
