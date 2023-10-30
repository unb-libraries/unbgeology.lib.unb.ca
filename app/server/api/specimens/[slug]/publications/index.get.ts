import { type Publication } from "entity-types/Specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select, filterSelect } = getQueryOptions(event)

  const specimen = await Specimen.findByPK(slug)
    .select(filterSelect({ prefix: `publications`, default: select.length ? [`_id`] : [] }))

  return sendEntityList<Publication>(event, specimen.publications)
})
