import { readFiles } from "h3-formidable"
import { File as FileEntity, File } from "~/server/entityTypes/File"

export default defineEventHandler(async (event) => {
  const upload = await readFiles(event, {
    keepExtensions: true,
  })

  const files = await Promise.all(Object.values(upload).map(files => files?.map(async (file) => {
    const { filepath, newFilename, originalFilename, mimetype, size } = file
    return await FileEntity.create({
      uploadName: originalFilename,
      filename: newFilename,
      filepath,
      filetype: originalFilename?.split(`.`).at(-1),
      filesize: size,
      type: mimetype?.split(`/`).at(0),
    })
  })).flat())

  return files.length > 1
    ? sendEntityList<File>(event, files)
    : sendEntity<File>(event, files[0])
})
