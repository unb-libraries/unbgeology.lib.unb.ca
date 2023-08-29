import Building from "~~/server/entityTypes/Building"

export default defineEventHandler(async (event) => {
  const { slug, number } = getRouterParams(event)

  const { matchedCount } = await Building
    .updateOne({ slug }, { $pull: { rooms: { number } } })

  if (matchedCount < 1) {
    throw createError({ statusCode: 404, statusMessage: `Building ${slug} not found.` })
  }

  return null
})
