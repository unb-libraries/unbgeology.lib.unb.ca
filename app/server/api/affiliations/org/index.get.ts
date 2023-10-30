import { Organization, type Organization as IOrganization } from "entity-types/Affiliation"

export default defineEventHandler(async (event) => {
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const organizations = await Organization.find()
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)
  
  return sendEntityList<IOrganization>(event, organizations, { total: await Organization.countDocuments() })
})