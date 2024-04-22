export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = await readOneDocumentBodyOr400(event, { model: Migration, flat: true })
  const update = await Migration.updateOne(body)
    .where(`_id`).eq(parseObjectID(id))

  return renderDocumentDiffOr404(update)
})
