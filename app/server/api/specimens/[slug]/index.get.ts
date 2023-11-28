import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select, filterSelect } = getQueryOptions(event)

  const specimen = await Specimen.findBySlug(slug)
    .select(getSelectedFields(select))
    .populate(`images`, filterSelect({ root: `images`, default: [`_id`, `filename`, `filepath`] }))
    .populate(`classifications`, filterSelect({ root: `classifications`, default: [`_id`, `label`] }))
    .populate(`collector`, filterSelect({ root: `collector`, default: [`_id`, `firstName`, `lastName`] }))
    .populate(`sponsor`, filterSelect({ root: `sponsor`, default: [`_id`, `firstName`, `lastName`] }))
    .populate(`storage.location`, filterSelect({ root: `storage.location` }))
    .populate(`editor`, filterSelect({ root: `editor`, default: [`_id`, `username`] }))

  return sendEntityOr404<Specimen>(event, specimen)
})
