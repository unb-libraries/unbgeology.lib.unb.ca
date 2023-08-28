import Building from "~~/server/entityTypes/Building"

export default defineEventHandler(async (event) => {
  const { slug, number } = getRouterParams(event)
  const { path } = event

  const doc = await Building
    .findOne({ slug })
    .select(
      {
        _id: false,
        rooms: { $elemMatch: { number } },
      })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Building object "${slug}" not found.` })
  }

  const { rooms } = doc
  if (rooms && rooms.length > 0) {
    return {
      self: path,
      ...rooms[0].toJSON(),
    }
  }

  throw createError({ statusCode: 404, statusMessage: `Room object "${number}" not found.` })
})
