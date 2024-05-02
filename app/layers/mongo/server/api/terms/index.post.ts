export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^term(:\w)*$/.test(r))
  if (resources.length < 1) {
    return create403(`Unauthorized to create term entities.`)
  }

  const fields = getAuthorizedFields(event, ...resources)
  const body = await readDocumentBodyOr400(event, { model: Term, fields })
  const termOrTerms = await Term.create(body)

  return Array.isArray(termOrTerms)
    ? renderDocumentList(termOrTerms, {
      model: Term,
      pageSize: termOrTerms.length,
      canonical: {
        self: term => `/api/terms/${term._id}`,
      },
    })
    : renderDocument(termOrTerms, {
      model: Term,
      self: term => `/api/terms/${term._id}`,
    })
})
