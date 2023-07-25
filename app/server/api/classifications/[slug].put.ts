import Classification, { type Classification as IClassification } from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  const { super: newSuper, ...update } = await readBody(event)

  const classification: IClassification | undefined = await Classification.findOne({ slug })
  if (!classification) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  if (newSuper !== undefined && newSuper !== ``) {
    const parent: IClassification | undefined = await Classification.findOne({ $or: [{ name: newSuper }, { slug: newSuper }] })
    if (!parent) {
      throw createError({ statusCode: 400, statusMessage: `Cannot attach to non-existing classification object ${newSuper}.` })
    }
    update.super = parent
  } else if (newSuper === ``) {
    update.$unset = { super: `` }
  }

  await Classification.updateOne({ slug }, update)
  return await Classification
    .findOne({ slug })
    .populate({ path: `super`, select: { _id: 0, name: 1, slug: 1 } })
    .select({ _id: 0, __v: 0 })
})
