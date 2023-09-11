export default defineEventHandler(useEntityCreateHandler(Taxonomy, { discriminatorKey: `type` }))
