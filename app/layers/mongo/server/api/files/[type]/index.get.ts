import { File as FileEntity } from "layers/mongo/server/entityTypes/File"
import { type File } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const files = await FileEntity.find({ type })
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)
  return sendEntityList<File>(event, files)
})