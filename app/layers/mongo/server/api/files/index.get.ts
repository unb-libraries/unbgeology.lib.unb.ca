import { type JFileList } from "@unb-libraries/nuxt-layer-entity"
import formatFile from "../../utils/api/files/format"
import { type File } from "../../documentTypes/FileBase"

export default defineMongooseHandler(FileBase, async (event) => {
  const File = getMongooseModel<File>(event)
  const { page, pageSize } = getQueryOptions(event)
  const { sortFields, fields, filter } = getMongooseQuery(event)

  const { documents: files, total } = await File.find()
    .select(...fields)
    .sort(...sortFields)
    .where(...filter)
    .paginate(page, pageSize)

  return createContentOr404<JFileList>(formatFile(files, { total }))
})
