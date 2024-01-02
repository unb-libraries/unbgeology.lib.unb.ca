import { readFile } from "fs/promises"
import { Status } from "layers/base/types/migrate"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = await readEntityBody(event, migrationBodyReader)

  const original = await Migration.findByPK(id)
  let updated = await Migration
    .findByPKAndUpdate(id, body, { new: true })
    .populate(`source`)

  if (original.status !== updated.status && updated.status === Status.RUNNING) {
    const data = JSON.parse(await readFile(updated.source.filepath, { encoding: `utf8` }))
    if (Array.isArray(data)) {
      await Promise.all(data.map(async (record) => {
        const { id: sourceId, ...body } = record
        const uri = useAppConfig().entityTypes[updated.entityType].baseURI
        await $fetch(uri, {
          method: `POST`,
          body,
        })
      }))

      updated = await Migration
        .findByPKAndUpdate(id, { status: Status.SUCCEDED }, { new: true })
        .populate(`source`)
    }
  }

  return sendEntityOr404(event, updated)
})
