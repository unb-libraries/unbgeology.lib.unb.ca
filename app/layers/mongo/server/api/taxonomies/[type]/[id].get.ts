export default defineEventHandler(useEntityReadHandler(Taxonomy, { discriminatorKey: `type` }))
