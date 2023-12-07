import { type Organization } from "document-types/Organization"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const organization = await Organization.create(body)
  return sendEntity<Organization>(event, organization)
})
