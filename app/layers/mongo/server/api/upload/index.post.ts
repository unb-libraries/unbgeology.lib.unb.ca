import fs from "fs/promises"
import { readFiles } from "h3-formidable"
import { File as FileEntity } from "layers/mongo/server/documentTypes/File"
import { type File } from "layers/base/types/entity"

const { APP_ROOT } = process.env

export default defineEventHandler(async (event) => {
  const upload = await readFiles(event, {
    includeFields: true,
    keepExtensions: true,
  })

  const { fields } = upload
  const persisted = fields.persisted && Array.isArray(fields.persisted) && Boolean(fields.persisted[0])
  const files = await Promise.all(Object.values(upload.files).map(files => files?.map(async (file) => {
    const { originalFilename, mimetype, size } = file
    let { filepath, newFilename } = file
    const type = mimetype?.split(`/`)[0] ?? `file`

    if (persisted) {
      const dir = `${APP_ROOT}/public/${type !== `file` ? type : ``}`
      try {
        await fs.mkdir(dir)
      } catch (err: any) {
        if (err.code !== `EEXIST`) {
          throw err
        }
      }

      const newFilepath = `${dir}/${originalFilename ?? newFilename}`
      await fs.copyFile(filepath, newFilepath)
      await fs.rm(filepath)

      filepath = newFilepath
      newFilename = originalFilename ?? newFilename
    }

    return await FileEntity.create({
      uploadName: originalFilename,
      filename: originalFilename,
      filepath,
      persisted,
      filetype: originalFilename?.split(`.`).at(-1),
      filesize: size,
      type: mimetype?.split(`/`).at(0),
    })
  })).flat())

  return files.length > 1
    ? sendEntityList<File>(event, files)
    : sendEntity<File>(event, files[0])
})
