export default defineEventHandler(async (event) => {
  const body = await readDocumentBodyOr400(event, { model: Term })
  const termOrTerms = await Term.create(body)

  return Array.isArray(termOrTerms)
    ? renderDocumentList(termOrTerms, { model: Term, pageSize: termOrTerms.length })
    : renderDocument(termOrTerms, { model: Term })
})
