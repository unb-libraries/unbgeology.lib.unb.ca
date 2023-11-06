import { type Specimen } from "types/specimen"

export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const { select, filterSelect } = getQueryOptions(event)

  const specimen = await Specimen.findByPK(slug)
    .select(getSelectedFields(select))
    .populate(`images`, filterSelect({ root: `images`, default: [`_id`] }))
    .populate(`classifications`, filterSelect({ root: `classifications`, default: [`_id`] }))
    .populate(`collector`, filterSelect({ root: `collector`, default: [`_id`] }))
    .populate(`sponsor`, filterSelect({ root: `sponsor`, default: [`_id`] }))
    .populate(`loans.organization`, filterSelect({ root: `loans.organization` }))
    .populate(`storage.location`, filterSelect({ root: `storage.location` }))
    .populate(`editor`, filterSelect({ root: `editor`, default: [`_id`, `username`] }))

  return sendEntityOr404<Specimen>(event, specimen)
})
