import { readFile } from "fs/promises"

export default defineEventHandler(async (event) => {
  const { filename } = event.context.params!
  const { uploadDir } = useRuntimeConfig()

  const img = await readFile(`${uploadDir}${filename}`)
  return send(event, img)
})
