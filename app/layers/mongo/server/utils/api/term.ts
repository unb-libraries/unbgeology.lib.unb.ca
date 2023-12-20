import { type H3Event } from "h3"

export async function termBodyReader(body: any, event: H3Event) {
  const { domain, type } = getRouterParams(event)

  const { parent: parentURI, ...termBody } = body
  termBody.type = domain === `default` ? type : `${domain}.${type}`

  if (parentURI) {
    const parent = await TermBase.findByURI(parentURI)
    if (parent) {
      termBody.parent = parent
    }
  } else if (parentURI === null) {
    body.parent = null
  }

  return termBody
}
