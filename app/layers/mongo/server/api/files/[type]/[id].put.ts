import { Image as ImageEntity } from "layers/mongo/server/entityTypes/File"
import { type Image } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const body = await readBody(event)

  const image = await ImageEntity.findOneAndUpdate({ _id: id }, body, { new: true })
  return sendEntityOr404<Image>(event, image)
})
