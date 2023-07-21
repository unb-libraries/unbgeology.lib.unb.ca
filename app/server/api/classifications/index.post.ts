import Classification, { type Classification as IClassification } from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  const { name, slug, super: parentNameOrSlug } = await readBody(event)

  try {
    await Classification.create({
      name,
      slug,
      super: await Classification
        .findOne<IClassification>({ $or: [{ name: parentNameOrSlug }, { slug: parentNameOrSlug }] })
        .exec(),
    })

    const classification = await Classification
      .findOne({ slug })
      .populate({ path: `super`, select: { _id: 0, name: 1, slug: 1 } })
      .select({ _id: 0, __v: 0 })

    setResponseStatus(event, 201, `Classification object created.`)
    return classification
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
