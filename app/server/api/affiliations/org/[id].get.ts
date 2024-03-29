import { type Organization } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const organization = await Organization.findById(id)
    .select(getSelectedFields(select))
  return sendEntityOr404<Organization>(event, organization)
})
