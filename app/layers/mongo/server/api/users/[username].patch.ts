export default defineEventHandler(async (event) => {
  const { username } = getRouterParams(event)
  const body = await readOneDocumentBodyOr400(event, { model: User, flat: true })
  const user = await User.updateOne(body)
    .where(`username`).eq(username)
  return renderDocumentDiffOr404(user, { model: User })
})
