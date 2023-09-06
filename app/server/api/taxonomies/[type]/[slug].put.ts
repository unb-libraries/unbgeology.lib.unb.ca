import { type ITaxonomy } from "entity-types/Taxonomy"
import { type Model } from "mongoose"

export default defineEventHandler(async (event) => {
  const { type, slug } = getRouterParams(event)
  const update: Partial<ITaxonomy> = await readBody(event)

  const Discriminator: Model<ITaxonomy> | undefined = Object
    .values(Taxonomy.discriminators || {})
    .find(t => t.modelName.toLowerCase() === type)

  if (!Discriminator) {
    throw createError({ statusCode: 400, statusMessage: `Taxonomy ${type} does not exist.` })
  }

  const doc = await Discriminator
    .updateOne({ slug }, { ...update })

  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Taxonomy object "${type}:${slug}" not found.` })
  }

  return $fetch(`/api/taxonomies/${type}/${update.slug || slug}`)
})
