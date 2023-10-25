import { File as FileEntity, type File } from "~/server/entityTypes/File"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const files = await FileEntity.find({ type })
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .skip((page - 1) * pageSize)
    .limit(pageSize)
  return sendEntityList<File>(event, files)
})
