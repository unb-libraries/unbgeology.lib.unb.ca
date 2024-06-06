export default defineEventHandler(async (event) => {
  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const fields = getAuthorizedFields(event, ...resources)
  if (!resources.length) {
    return create403()
  }

  const body = await readDocumentBodyOr400(event, { model: Specimen.Base, fields })
  const specimenOrSpecimens = await Specimen.Base.create(body)

  return Array.isArray(specimenOrSpecimens)
    ? renderDocumentList(specimenOrSpecimens, {
      model: Specimen.Base,
      canonical: {
        fields,
        self: specimen => `/api/specimens/${specimen.slug}`,
      },
      self: () => `/api/specimens`,
    })
    : renderDocument(specimenOrSpecimens, { model: Specimen.Base, fields, self: specimen => `/api/specimens/${specimen.slug}` })
})
