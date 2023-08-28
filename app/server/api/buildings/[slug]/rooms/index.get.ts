import Building from "~~/server/entityTypes/Building"
import { type IRoom } from "~~/server/entityTypes/Room"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { path } = event

  const doc = await Building.findOne({ slug })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Building object "${slug}" not found.` })
  }

  return doc.rooms.map((room: IRoom) => ({
    self: `${path}/${room.number}`,
    ...room.toJSON(),
  }))
})
