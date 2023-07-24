import { readFile } from "fs/promises"

export default defineEventHandler(async (event) => {
  const { filename } = event.context.params!

  const img = await readFile(`/app/files/${filename}`)
  return send(event, img)
})
