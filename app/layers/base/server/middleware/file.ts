import { readFiles } from "h3-formidable"

export default defineEventHandler(async (event) => {
  if (event.path === `/api/upload`) {
    event.context.files = await readFiles(event, {
      includeFields: true,
      keepExtensions: true,
    })
  }
})
