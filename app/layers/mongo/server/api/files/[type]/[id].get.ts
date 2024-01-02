import { type Image } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { type, id } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const File = useFileDocumentType(type ?? `file`)
  const image = await File.findById(id)
    .select(select)
  return sendEntityOr404<Image>(event, image)
})
