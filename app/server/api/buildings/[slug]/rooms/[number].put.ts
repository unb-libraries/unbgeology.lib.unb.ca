import Building from "~~/server/entityTypes/Building"

export default defineEventHandler(async (event) => {
  const { slug, number } = getRouterParams(event)

  const update = await readBody(event)
  const updateEntries = Object.entries(update).map(([field, value]) => [`rooms.$.${field}`, value])

  const { matchedCount } = await Building
    .updateOne({ slug, "rooms.number": number }, { $set: { ...Object.fromEntries(updateEntries) } })

  if (matchedCount < 1) {
    throw createError({ statusCode: 404, statusMessage: `Building object "${slug}" not found.` })
  }

  return $fetch(`/api/buildings/${slug}/rooms/${number}`)
})
