import { MigrationStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineMongooseReader(Migration, async (payload, { op }) => {
  const create = op === `create`
  const { source, ...body } = await validateBody(payload, {
    name: requireIf(create, StringValidator),
    entityType: requireIf(create, StringValidator),
    source: requireIf(create, ArrayValidator(URIEntityTypeValidator(`other`))),
    dependencies: optional(ArrayValidator(URIEntityTypeValidator(`migration`))),
    status: optional(EnumValidator(MigrationStatus)),
  })

  return {
    ...body,
    source: source && source.map(src => ({ _id: src.id })),
  }
})
