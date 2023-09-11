import { type Model } from "mongoose"
import { type Taxonomy } from "~/layers/mongo/types/taxonomy"

export default defineEventHandler(async (event) => {
  const { type, slug } = getRouterParams(event)

  const Discriminator: Model<Taxonomy> | undefined = Object
    .values(Taxonomy.discriminators || {})
    .find(t => t.modelName.toLowerCase() === type)

  if (!Discriminator) {
    throw createError({ statusCode: 400, statusMessage: `Taxonomy ${type} does not exist.` })
  }

  const doc = await Discriminator.findOne({ slug })
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: `Taxonomy object "${type}:${slug}" not found.` })
  }

  const ids = [doc._id.toString()]
  const childDocs = await Discriminator.aggregate()
    .match({ slug })
    .graphLookup({
      from: `taxonomies`,
      startWith: `$_id`,
      connectFromField: `_id`,
      connectToField: `parent`,
      as: `child`,
    })
    .project({
      child: {
        _id: 1,
      },
    })

  if (childDocs.length > 0) {
    ids.push(...childDocs[0].child.map((child: { _id: string }) => child._id))
  }

  await Discriminator.deleteMany({ _id: { $in: ids } })

  return null
})
