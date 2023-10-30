export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  function getAffilationFields() {
    const fields = getSelectedFields(select, `affiliations`)
    return fields.length > 0 ? fields : [`_id`]
  }

  const person = await Person.findByID(id)
    .select(getSelectedFields(select))
    .populate(`affiliations`, getAffilationFields())
  return sendEntityOr404(event, person)
})