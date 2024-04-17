import { type EntityJSONList } from "@unb-libraries/nuxt-layer-entity"
import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event): Promise<EntityJSONList<Specimen>> => {
  const { page, pageSize } = getQueryOptions(event)

  const query = Specimen.Base.find()
  await useEventQuery(event, query)

  const { documents: specimens, total } = await query
    .paginate(page, pageSize)

  return renderDocumentList(specimens, {
    model: Specimen.Base,
    canonical: {
      self: specimen => `/api/specimens/${specimen.slug}`,
    },
    total,
  })
})
