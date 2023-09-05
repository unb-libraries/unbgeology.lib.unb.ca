import Taxonomy from "entity-types/Taxonomy"

export default defineEventHandler(async (event) => {
  const { type } = getRouterParams(event)
  const { label, slug, ...other } = await readBody(event)

  return await Taxonomy.create({ label, slug, __t: type, ...other })
})
