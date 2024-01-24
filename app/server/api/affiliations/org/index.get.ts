import { type Organization } from "~/types/affiliation"

export default defineEventHandler(async (event) => {
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const organizations = await Organization.find()
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<Organization>(event, organizations, { total: await Organization.countDocuments() })
})
