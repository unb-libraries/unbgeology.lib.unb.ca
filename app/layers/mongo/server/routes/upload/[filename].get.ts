import { readFile } from "fs/promises"
import { decode } from "ufo"

export default defineEventHandler(async (event) => {
  const { filename: encodedFilename } = getRouterParams(event)
  const filename = decode(encodedFilename)

  const resources = getAuthorizedResources(event, r => /^file(:\w)*$/.test(r))
  const file = await FileBase.findOne()
    .where(`filename`).eq(filename)
    .and(`authTags`).in(resources)

  if (file) {
    const buffer = await readFile(file.filepath)
    // TODO: Use "sharp" to resize image
    return new Response(buffer, {
      headers: { "Content-Type": file.mimetype },
    })
  }
  return sendError(event, create404(`File not found`))
})
