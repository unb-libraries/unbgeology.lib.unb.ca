import { type File as IFile } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { type, id } = getRouterParams(event)
  const body = await readBody(event)

  const File = useFileDocumentType(type ?? `file`)
  const file = await File.findOneAndUpdate({ _id: id }, body, { new: true })
  return sendEntityOr404<IFile>(event, file)
})
