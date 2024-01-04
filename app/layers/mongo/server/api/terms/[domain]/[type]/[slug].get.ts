import { type Term } from "@unb-libraries/nuxt-layer-entity"

export default defineEventHandler(async (event) => {
  const { domain, type, slug } = getRouterParams(event)
  const { select } = getQueryOptions(event)

  const term = await TermBase.findOne({ type: domain === `default` ? type : `${domain}.${type}`, slug })
    .populate(`parent`, getSelectedFields(select, `parent`))
    .select(getSelectedFields(select))

  return sendEntityOr404<Term>(event, term)
})
