import { readFiles } from "h3-formidable"

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  if (pathname === `/api/upload`) {
    event.context.files = await readFiles(event, {
      includeFields: true,
      keepExtensions: true,
    })
  }
})
