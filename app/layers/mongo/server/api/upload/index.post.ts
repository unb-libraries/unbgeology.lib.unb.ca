import fs from "fs/promises"
import { type Files, type File as FFile, type Fields } from "formidable"
import { type File as IFile } from "layers/base/types/entity"

const { APP_ROOT } = process.env

export default defineEventHandler(async (event) => {
  const formData = event.context.files
  const fields = formData.fields as Fields
  const files = (formData.files as Files).files ?? [] as FFile[]

  const persisted = fields.persisted && Array.isArray(fields.persisted) && Boolean(fields.persisted[0])
  let type = Array.isArray(fields.type) && fields.type.length > 0 ? fields.type[0] : null

  const entities = await Promise.all(files.map(async (file) => {
    const { originalFilename, size } = file
    let { filepath, newFilename } = file

    if (!type) {
      const ext = originalFilename?.split(`.`).at(-1)
      if (ext && [`jpg`, `jpeg`, `png`].includes(ext)) {
        type = `image`
      } else if (ext && [`pdf`].includes(ext)) {
        type = `document`
      }
    }

    if (persisted) {
      const dir = `${APP_ROOT}/public/${type ?? `other`}`
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

    const File = useFileDocumentType(type ?? `file`)
    return await File.create({
      uploadName: originalFilename,
      filename: originalFilename,
      filepath,
      persisted,
      filetype: originalFilename?.split(`.`).at(-1),
      filesize: size,
    })
  }))

  return entities.length > 1
    ? sendEntityList<IFile>(event, entities)
    : sendEntity<IFile>(event, entities[0])
})
