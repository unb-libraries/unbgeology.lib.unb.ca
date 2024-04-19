export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)

  const body = await readOneBodyOr400(event, { flat: true })
  const update = await Specimen.Base.updateOne(body)
    .where(`slug`).eq(slug)

  return renderDocumentDiffOr404(update, { model: Specimen.Base })
})
