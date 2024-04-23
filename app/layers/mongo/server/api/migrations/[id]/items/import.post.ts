import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { pageSize, page } = getQueryOptions(event)

  const query = MigrationItem.find()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .where(`status`).eq(MigrationItemStatus.INITIAL)
    .select(`migration.dependencies`)
    .select([`_sourceID`, `$sourceID`])
  await useEventQuery(event, query)
  const { documents: items, total } = await query
    .paginate(page, pageSize)

  return runTask(`migrate:import`, {
    payload: {
      items: await renderDocumentList(items, {
        model: MigrationItem,
        total,
        canonical: {
          // @ts-ignore
          self: item => `/api/migrations/${id}/items/${item._sourceID}`,
        },
        self: () => `/api/migrations/${id}/items`,
      }),
    },
  })
})
