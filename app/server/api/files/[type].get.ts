import { File as FileEntity, type File } from "~/server/entityTypes/File"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const files = await FileEntity.find({ type })
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)
  return sendEntityList<File>(event, files)
})
