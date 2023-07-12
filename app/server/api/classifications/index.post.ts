import Classification, { type Classification as IClassification } from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  const { name, slug, super: parentNameOrSlug } = await readBody(event)
  const classification: Partial<IClassification> = { name, slug }

  try {
    if (parentNameOrSlug) {
      const parent = await Classification
        .findOne<IClassification>({ $or: [{ name: parentNameOrSlug }, { slug: parentNameOrSlug }] })
        .exec()
      if (parent) {
        classification.super = parent
        classification.subClassOf = [parent, ...parent.subClassOf]
      }
    }

    await Classification.create(classification)
    return await Classification
      .aggregate()
      .match({ slug })
      .lookup({
        from: `classifications`,
        localField: `subClassOf`,
        foreignField: `_id`,
        as: `superiors`,
      })
      .project({
        name: 1,
        slug: 1,
        super: {
          $map: {
            input: `$superiors`,
            as: `superior`,
            in: {
              name: `$$superior.name`,
              slug: `$$superior.slug`,
            },
          },
        },
        _id: 0,
      })
  } catch (err: any) {
    // Duplicate key
    if (err.code && err.code === 11000) {
      const [field, value] = Object.entries(err.keyValue)[0]
      throw createError({ statusCode: 400, statusMessage: `Category object with ${field} "${value}" already exists.` })
    }

    // Missing parameters
    if (err.errors) {
      type ValidationError = {kind: string, path: string}
      const fields = Object
        .values<ValidationError>(err.errors)
        .reduce((fields: string[], e) => e.kind === `required` ? [...fields, e.path] : fields, [])
      throw createError({ statusCode: 400, statusMessage: `Missing fields ${fields.join(`, `)} are required.` })
    }

    console.error(err)
    throw createError({ statusCode: 500, statusMessage: `Unexpected server error.` })
  }
})
