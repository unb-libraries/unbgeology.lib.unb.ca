import { File as FileEntity } from "layers/mongo/server/documentTypes/File"
import { type File } from "layers/base/types/entity"

export default defineEventHandler(async (event) => {
  const { select, sort, page, pageSize } = getQueryOptions(event)

  const files = await FileEntity.find()
    .select(getSelectedFields(select))
    .sort(sort.join(` `))
    .paginate(page, pageSize)

  return sendEntityList<File>(event, files)
})
