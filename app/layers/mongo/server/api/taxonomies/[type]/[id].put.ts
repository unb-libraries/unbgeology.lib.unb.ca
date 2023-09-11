export default defineEventHandler(useEntityUpdateHandler(Taxonomy, { discriminatorKey: `type` }))
