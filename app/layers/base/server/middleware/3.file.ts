import { readFiles } from "h3-formidable"

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname === `/api/upload`) {
    const resources = getAuthorizedResources(event, r => /^file(:\w)*$/.test(r))
    if (!resources.length) {
      return create403()
    }

    event.context.files = await readFiles(event, {
      includeFields: true,
      keepExtensions: true,
    })
  }
})
