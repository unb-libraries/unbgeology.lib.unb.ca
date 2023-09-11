import { type Taxonomy } from "entity-types/Taxonomy"
import { type Model } from "mongoose"

export default defineEventHandler(async (event) => {
  const { type, slug } = getRouterParams(event)
  const update = await readBody(event)

  const Discriminator: Model<Taxonomy> | undefined = Object
    .values(Taxonomy.discriminators || {})
    .find(t => t.modelName.toLowerCase() === type)

  if (!Discriminator) {
    throw createError({ statusCode: 400, statusMessage: `Taxonomy ${type} does not exist.` })
  }

  if (update.parent) {
    const parent = await Discriminator.findOne({ slug: update.parent })
    if (!parent) {
      throw createError({ statusCode: 400, statusMessage: `Taxonomy ${update.parent} does not exist.` })
    }
    update.parent = parent._id
  }

  const { matchedCount } = await Discriminator
    .updateOne({ slug }, { ...update })

  if (matchedCount < 1) {
    throw createError({ statusCode: 404, statusMessage: `Taxonomy object "${type}:${slug}" not found.` })
  }

  return $fetch(`/api/taxonomies/${type}/${update.slug || slug}`)
})
