import { type Person } from "document-types/Affiliation"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { affiliations: affiliationURIs, ...body } = await readBody(event)
  if (affiliationURIs) {
    body.affiliations = await Organization.findManyByURI(affiliationURIs)
  }

  const person = await Person.findOneAndUpdate({ _id: id }, body, { new: true })
  return sendEntity<Person>(event, person)
})
