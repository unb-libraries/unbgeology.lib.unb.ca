import Classification from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  const { slug } = event.context.params!
  const classification = await Classification
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

  if (classification.length) {
    return classification[0]
  }

  throw createError({ statusCode: 404, statusMessage: `Classification object "${slug}" not found.` })
})
