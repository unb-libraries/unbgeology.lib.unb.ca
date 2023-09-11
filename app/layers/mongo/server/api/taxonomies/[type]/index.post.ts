import { type Model } from "mongoose"
import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { label, slug, parent: parentSlug, ...other } = await readBody(event)

  const Discriminator: Model<Taxonomy> | undefined = Object
    .values(Taxonomy.discriminators || {})
    .find(t => t.modelName.toLowerCase() === type)

  if (!Discriminator) {
    throw createError({ statusCode: 400, statusMessage: `Taxonomy ${type} does not exist.` })
  }

  if (parentSlug) {
    const parent = await Discriminator.findOne({ slug: parentSlug })
    if (!parent) {
      throw createError({ statusCode: 400, statusMessage: `Taxonomy ${parentSlug} does not exist.` })
    }
    await Discriminator.create({ label, slug, parent: parent._id, ...other })
  } else {
    await Discriminator.create({ label, slug, ...other })
  }

  return $fetch(`/api/taxonomies/${type}/${slug}`)
})
