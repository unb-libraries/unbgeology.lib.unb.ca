import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseReader(Migration, async (payload, { op }) => {
  const create = op === `create`
  const { dependencies, status, ...body } = await validateBody(payload, {
    name: requireIf(create, StringValidator),
    items: optional(ArrayValidator(async (input: any) => {
      try {
        return await readOneDocumentBodyOr400(input, { model: MigrationItem })
      } catch (err: unknown) {
        throw new TypeError(`Invalid input: "items" must be an array of MigrationItem objects.`)
      }
    })),
    entityType: requireIf(create, StringValidator),
    dependencies: optional(ArrayValidator(URIEntityTypeValidator(`migration`))),
    status: optional(EnumValidator(MigrationStatus)),
  })

  return {
    ...body,
    dependencies: dependencies && dependencies.map(({ id }) => ({ _id: id })),
    status: status && useEnum(MigrationStatus).valueOf(status),
  }
})
