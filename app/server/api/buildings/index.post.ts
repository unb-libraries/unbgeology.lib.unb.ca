import Building, { type IBuilding } from "~~/server/entityTypes/Building"

export default defineEventHandler((async event => {
  const { name, slug, address } = await readBody(event)
  const { path } = event
  
  const { errors } = (await Building.create([{ name, slug, address }], { aggregateErrors: true }))[0]
  
  if (errors) {
    return errors
  }

  const doc = await Building.findOne({ slug }).select(`-_id -__v`)
  return {
    self: `${path}/${slug}`,
    ...doc.toJSON(),
    rooms: {
      self: `${path}/${slug}/rooms`
    },
    created: new Date(doc.created),
    updated: new Date(doc.updated),
  }
}))