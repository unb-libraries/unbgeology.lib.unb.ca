import { type Image } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { type, id } = getRouterParams(event)
  const body = await readBody(event)

  const File = useFileDocumentType(type ?? `file`)
  const image = await File.findOneAndUpdate({ _id: id }, body, { new: true })
  return sendEntityOr404<Image>(event, image)
})
