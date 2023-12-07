import { Image as ImageEntity } from "layers/mongo/server/documentTypes/File"
import { type Image } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const image = await ImageEntity.findById(id)
    .select(select)
  return sendEntityOr404<Image>(event, image)
})
