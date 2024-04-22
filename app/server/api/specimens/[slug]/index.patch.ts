export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const body = await readOneDocumentBodyOr400(event, { model: Specimen.Base, flat: true, flattenExcept: [`portion`] })
  const update = await Specimen.Base.updateOne(body)
    .where(`slug`).eq(slug)

  return renderDocumentDiffOr404(update, { model: Specimen.Base })
})
