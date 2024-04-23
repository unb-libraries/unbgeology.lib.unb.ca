import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseReader(MigrationItem, async (payload, { op }) => {
  const create = op === `create`

  const { status: statusStr } = await validateBody(payload, {
    status: optional(EnumValidator(MigrationItemStatus)),
  })
  const status = statusStr && useEnum(MigrationItemStatus).valueOf(statusStr)

  const { id: sourceID, ...body } = await validateBody(payload, {
    id: requireIf(create, NumberValidator),
    data: requireIf(create, (input: any) => {
      try {
        const stringified = JSON.stringify(input)
        const parsed = JSON.parse(stringified)
        if (JSON.stringify(parsed) === stringified) {
          return parsed
        }
      } catch (e: unknown) {
        // ignore
      }
      throw new TypeError(`Invalid input: "data" must be JSON serializable object.`)
    }),
    entityURI: requireIf(status === MigrationItemStatus.IMPORTED, StringValidator),
    error: requireIf(status === MigrationItemStatus.ERRORED, StringValidator),
  })

  return {
    ...body,
    sourceID,
    status,
  }
})
