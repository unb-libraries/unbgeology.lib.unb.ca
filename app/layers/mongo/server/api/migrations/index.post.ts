import { readFile } from "fs/promises"

export default defineEventHandler(async (event) => {
  const body = await readEntityBody(event, migrationBodyReader)

  const migration = await Migration.create(body)
  await migration.populate(`source`)
  await migration.populate(`dependencies`, `name entityType`)

  migration.source.forEach(async (source) => {
    const json = await readFile(source.filepath, { encoding: `utf8` })
    const items = JSON.parse(json)
    useNitroApp().hooks.callHook(`migrate:init`, migration, items)
  })

  return sendEntity(event, migration)
})
