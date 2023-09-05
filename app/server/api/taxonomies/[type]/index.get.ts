import Taxonomy from "entity-types/Taxonomy"

export default defineEventHandler(async (event) => {
  const { path } = event
  const { type } = getRouterParams(event)

  const docs = await Taxonomy
    .find()
    .select(`-_id -__v`)

  return docs
    .map(doc => doc.toJSON({
      transform(doc, ret, options) {
        ret.type = ret.__t
        delete ret.__t
        return ret
      },
    }))
    .map(doc => ({
      self: `${path}/${doc.slug}`,
      ...doc,
      created: new Date(doc.created),
      updated: new Date(doc.updated),
    }))
})
