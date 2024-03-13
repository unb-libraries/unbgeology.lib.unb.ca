import formatFile from "../../utils/api/files/format"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { fields } = getMongooseQuery(event)

  const file = await FileBase.findByID(id)
    .select(...fields)

  return createContentOr404(formatFile.one(file))
})
