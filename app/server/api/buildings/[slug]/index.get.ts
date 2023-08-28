import Building from "~~/server/entityTypes/Building"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { path } = event

  const doc = await Building
    .findOne({ slug })
    .select(`-_id -__v -rooms`)

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Building object "${slug}" not found.` })
  }

  return {
    self: path,
    ...doc.toJSON(),
    rooms: {
      self: `${path}/rooms`,
    },
    created: new Date(doc.created),
    updated: new Date(doc.updated),
  }
})
