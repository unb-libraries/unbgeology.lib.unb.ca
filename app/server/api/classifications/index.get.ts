import Classification from "entity-types/Classification"

export default defineEventHandler(async (event) => {
  return await Classification
    .find()
    .populate({ path: `super`, select: { _id: 0, name: 1, slug: 1 } })
    .select({ _id: 0, __v: 0 })
})
