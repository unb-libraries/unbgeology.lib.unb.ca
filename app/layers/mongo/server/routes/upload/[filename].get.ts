import { createReadStream } from "fs"
import { join } from "path"
import { createIPX, ipxFSStorage } from "ipx"
import { decode } from "ufo"
import ImageFile from "../../documentTypes/Image"

export default defineEventHandler(async (event) => {
  const { uploads } = useRuntimeConfig(event)
  const { dir } = uploads as { dir: string }

  const { filename: encodedFilename } = getRouterParams(event)
  const filename = decode(encodedFilename)

  const resources = getAuthorizedResources(event, r => /^file(:\w+)*$/.test(r))
  const file = await FileBase.findOne()
    .where(`filename`).eq(filename)
    .and(`authTags`).in(resources)

  if (file?.type === ImageFile.fullName) {
    const ipx = createIPX({
      maxAge: 60 * 60 * 24, // 1 day
      storage: ipxFSStorage({ dir }),
    })

    // TODO: Support ALL IPX options
    const ipxOptions: Parameters<typeof ipx>[1] = {}
    const { w: width, h: height } = getQuery(event)
    if (width && height) {
      ipxOptions.resize = `${width}x${height}`
    } else if (width) {
      ipxOptions.width = `${width}`
    } else {
      ipxOptions.height = `${height}`
    }

    const { data } = await ipx(filename, ipxOptions)
      .process()
    return new Response(data)
  } else if (file) {
    const stream = createReadStream(join(dir, filename))
    setResponseHeader(event, `Content-Type`, file.mimetype)
    return sendStream(event, stream)
  }

  return sendError(event, create404(`File not found`))
})
