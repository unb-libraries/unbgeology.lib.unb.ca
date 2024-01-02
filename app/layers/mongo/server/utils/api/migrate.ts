import { readFile } from "fs/promises"
import { type H3Event } from "h3"

export async function migrationBodyReader(body: any, event: H3Event) {
  const { source: fileURI, ...migrationBody } = body
  if (fileURI) {
    const source = await FileBase.findByURI(fileURI)
    if (source) {
      migrationBody.source = source
      const data = JSON.parse(await readFile(source.filepath, { encoding: `utf8` }))
      if (Array.isArray(data)) {
        migrationBody.total = data.length
      }
    }
  }

  return migrationBody
}
