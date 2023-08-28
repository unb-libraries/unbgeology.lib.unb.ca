import Building from "~~/server/entityTypes/Building"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { deletedCount } = await Building.deleteOne({ slug })

  if (deletedCount > 0) {
    return null
  }

  throw createError({ statusCode: 404, statusMessage: `Building ${slug} not found.` })
})
