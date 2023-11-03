import { Image as ImageEntity } from "layers/mongo/server/entityTypes/File"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  await ImageEntity.deleteOne({ _id: id })
  return sendNoContent(event)
})
