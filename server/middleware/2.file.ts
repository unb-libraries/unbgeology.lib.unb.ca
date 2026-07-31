// REFACTOR: h3-formidable is not needed to process file data and can be done with just h3.
import { readFiles } from "h3-formidable"

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname === `/api/upload`) {
    const resources = getAuthorizedResources(event, r => /^file(:\w+)*$/.test(r))
    if (!resources.length) {
      return create403()
    }

    const { maxFileSize, maxTotalFileSize, maxFiles } = useRuntimeConfig(event).public
    event.context.files = await readFiles(event, {
      includeFields: true,
      keepExtensions: true,
      maxFileSize,
      maxTotalFileSize,
      maxFiles,
    })
  }
})
