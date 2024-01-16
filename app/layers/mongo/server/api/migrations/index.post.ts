import { readFile } from "fs/promises"
import { parseFile } from "@fast-csv/parse"

export default defineEventHandler(async (event) => {
  const body = await readEntityBody(event, migrationBodyReader)

  const migration = await Migration.create(body)
  await migration.populate(`source`)
  await migration.populate(`dependencies`, `name entityType`)

  migration.source.forEach(async (source) => {
    switch (source.filetype) {
      case `json`: {
        const json = await readFile(source.filepath, { encoding: `utf8` })
        const items = JSON.parse(json)
        useNitroApp().hooks.callHook(`migrate:init`, migration, items)
      }; break
      case `csv`:{
        const items: any[] = []
        let header: string[] = []
        parseFile(source.filepath)
          .on(`data`, (row: string[]) => {
            if (header.length === 0) {
              header = row.map(col => col.toLowerCase())
            } else {
              const item = Object.fromEntries(row.map((col, index) => [header[index], col]))
              items.push(item)
            }
          })
          .on(`end`, (count: number) => {
            useNitroApp().hooks.callHook(`migrate:init`, migration, items)
          })
      }; break
      default:
    }
  })

  return sendEntity(event, migration)
})
