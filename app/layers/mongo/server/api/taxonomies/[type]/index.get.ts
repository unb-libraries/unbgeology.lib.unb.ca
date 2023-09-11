import { type Model } from "mongoose"
import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export default defineEventHandler(async (event) => {
  const { path } = event
  const { type } = getRouterParams(event)

  const Discriminator: Model<Taxonomy> | undefined = Object
    .values(Taxonomy.discriminators || {})
    .find(t => t.modelName.toLowerCase() === type)

  if (!Discriminator) {
    throw createError({ statusCode: 400, statusMessage: `Taxonomy ${type} does not exist.` })
  }

  const docs = await Discriminator
    .find()
    .populate(`parent`)
    .select(`-_id -__v`)

  return docs
    .map(doc => doc.toJSON({
      transform(doc, ret, options) {
        ret.type = ret.__t
        delete ret.__t

        if (ret.parent) {
          ret.parent = {
            self: `/api/taxonomies/${type}/${ret.parent.slug}`,
          }
        }

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