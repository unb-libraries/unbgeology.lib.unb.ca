import Building from "~~/server/entityTypes/Building"

export default defineEventHandler((async event => {
  const { slug } = getRouterParams(event)

  const { name, address = {} } = await readBody(event)
  const addressUpdateEntries = Object.entries(address).map(([field, value]) => [`address.${field}`, value])

  const { matchedCount } = await Building
    .updateOne({ slug }, { name, ...Object.fromEntries(addressUpdateEntries) })

  if (matchedCount < 1) {
    throw createError({ statusCode: 404, statusMessage: `Building ${slug} not found.`})
  }
  
  return $fetch(`/api/buildings/${slug}`)
}))