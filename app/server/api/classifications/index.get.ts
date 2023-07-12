import Classification from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  return await Classification
    .aggregate()
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
})
