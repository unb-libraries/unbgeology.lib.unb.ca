import Classification, { type Classification as IClassification } from "~/server/entityTypes/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  const { name: newName, slug: newSlug, super: newSuper } = await readBody(event)

  const classification: IClassification | undefined = await Classification.findOne({ slug })
  if (!classification) {
    throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
  }

  if (newSuper !== undefined && newSuper !== ``) {
    const parent: IClassification | undefined = await Classification.findOne({ $or: [{ name: newSuper }, { slug: newSuper }] })
    if (!parent) {
      throw createError({ statusCode: 400, statusMessage: `Cannot attach to non-existing classification object ${newSlug}.` })
    }

    await Classification.updateOne({ slug }, {
      name: newName || classification.name,
      slug: newSlug || classification.slug,
      super: parent,
    })
  } else if (newSuper === ``) {
    await Classification.updateOne({ slug }, {
      name: newName || classification.name,
      slug: newSlug || classification.slug,
      $unset: { super: `` },
    })
    await Classification.updateOne({ slug }, {
      name: newName || classification.name,
      slug: newSlug || classification.slug,
    })
  } else {
    await Classification.updateOne({ slug }, {
      name: newName || classification.name,
      slug: newSlug || classification.slug,
    })
  }

  return await Classification
    .findOne({ slug })
    .populate({ path: `super`, select: { _id: 0, name: 1, slug: 1 } })
    .select({ _id: 0, __v: 0 })
})
