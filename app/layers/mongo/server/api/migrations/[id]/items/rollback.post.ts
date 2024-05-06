import { MigrationItemStatus } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { pageSize, page } = getQueryOptions(event)

  const migrationResources = getAuthorizedResources(event, r => /^migration(:\w)*$/.test(r), { action: `update` })
  const migration = await Migration.findByID(id).select(`authTags`)
  if (!migration) {
    return create404()
  } else if (!migrationResources.length || !migration.authTags.some(t => migrationResources.includes(t))) {
    return create403()
  }

  const sessionName = useRuntimeConfig().public.session.name
  const Cookie = `${sessionName}=${getCookie(event, sessionName)}`

  const query = MigrationItem.find()
    .join(`migration`, Migration)
    .where(`migration._id`).eq(parseObjectID(id))
    .where(`status`).ne(MigrationItemStatus.INITIAL)
    .select([`_sourceID`, `$sourceID`])
  await useEventQuery(event, query)
  const { documents: items, total } = await query
    .paginate(page, pageSize)

  return runTask(`migrate:rollback`, {
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
      headers: {
        Cookie,
      },
    },
  })
})
