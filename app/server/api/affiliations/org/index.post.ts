import { type Organization } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const organization = await Organization.create(body)
  return sendEntity<Organization>(event, organization)
})
