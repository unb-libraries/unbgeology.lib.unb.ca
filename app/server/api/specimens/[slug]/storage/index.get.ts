export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select, filterSelect } = getQueryOptions(event)

  const query = Specimen.findByPK(slug)
    .sort(`dateIn`)
  
  const fields = filterSelect({ prefix: `storage`, default: select.length ? [`_id`] : [] })
  if (fields.length > 0) {
    query.select(fields)
  }

  const locationFields = filterSelect({ root: `location` })
  if (locationFields.length > 0) {
    query.populate(`storage.location`, locationFields)
  } else if (select.length < 1) {
    query.populate(`storage.location`, `_id`)
  }

  const specimen = await query.exec()
  
  return sendEntityList(event, specimen.storage)
})
