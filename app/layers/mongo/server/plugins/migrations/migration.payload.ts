import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseReader(Migration, async (payload, { op }) => {
  const create = op === `create`
  const { dependencies, status, ...body } = await validateBody(payload, {
    name: requireIf(create, StringValidator),
    entityType: requireIf(create, StringValidator),
    dependencies: optional(ArrayValidator(MatchValidator(/^\/api\/migrations\/[a-z0-9]{24}$/))),
    status: optional(EnumValidator(MigrationStatus)),
  })

  return {
    ...body,
    dependencies: dependencies && dependencies.map(({ id }) => ({ _id: id })),
    status: status && useEnum(MigrationStatus).valueOf(status),
  }
})
