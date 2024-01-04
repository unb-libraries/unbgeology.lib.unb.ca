import { type File as IFile } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { type, id } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const File = useFileDocumentType(type ?? `file`)
  const file = await File.findById(id)
    .select(select)
  return sendEntityOr404<IFile>(event, file)
})
