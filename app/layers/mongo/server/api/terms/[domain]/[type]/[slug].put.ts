import { EntityBodyCardinality } from "~/layers/mongo/types/api"

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event)
  const { domain, type, slug } = getRouterParams(event)

  const body = await readEntityBody(event, termBodyReader, { accept: EntityBodyCardinality.ONE })
  await TermBase.findOneAndUpdate({ type: domain === `default` ? type : `${domain}.${type}`, slug }, body, { new: true })

  return await $fetch(pathname)
})
