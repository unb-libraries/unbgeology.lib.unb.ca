export default defineEventHandler(useEntityCollectionHandler(Taxonomy, { discriminatorKey: `type` }))
