import { readFiles } from "h3-formidable"
import { type FieldsAndFiles } from "h3-formidable"

export default defineEventHandler(async (event) => {
  const { uploadDir } = useRuntimeConfig()
  const upload = await readFiles(event, {
    uploadDir,
    keepExtensions: true,
  })

  const files = [].concat(...Object.values(upload).map((files: FieldsAndFiles[`files`]) => files.map((file: FieldsAndFiles[`files`]) => {
    const { originalFilename, newFilename, mimetype, size } = file
    return {
      uploadName: originalFilename,
      filename: newFilename,
      filetype: mimetype,
      filesize: size,
    }
  })))

  return files.length > 1 ? files : files[0]
})
