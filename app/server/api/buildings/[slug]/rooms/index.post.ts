import Building, { type, IBuilding, type IRoom } from "~~/server/entityTypes/Building"

export default defineEventHandler((async event => {
  const { slug } = getRouterParams(event)
  
  const { number, public: isPublic = false } = await readBody(event)
  const { matchedCount } = await Building.updateOne({ slug }, { $push: { rooms: { number, public: isPublic }}})

  if (matchedCount < 1) {
    throw createError({ statusCode: 404, statusMessage: `Building ${slug} not found.`})
  }

  return $fetch(`/api/buildings/${slug}/rooms/${number}`)
}))