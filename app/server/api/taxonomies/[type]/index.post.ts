import { type ITaxonomy } from "entity-types/Taxonomy"
import { type Model } from "mongoose"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { label, slug, ...other } = await readBody(event)

  const Discriminator: Model<ITaxonomy> | undefined = Object
    .values(Taxonomy.discriminators || {})
    .find(t => t.modelName.toLowerCase() === type)

  if (!Discriminator) {
    throw createError({ statusCode: 400, statusMessage: `Taxonomy ${type} does not exist.` })
  }

  return await Discriminator
    .create({ label, slug, ...other })
})
