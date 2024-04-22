export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  const body = await readOneBodyOr400(event, { flat: true })
  const update = await Migration.updateOne(body)
    .where(`_id`).eq(parseObjectID(id))

  return renderDocumentDiffOr404(update)
})
