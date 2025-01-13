import { objectHash, sha256base64 } from "ohash"
import type { H3Event } from "h3"

export function getSpecimenRequestCacheId(event: H3Event) {
  const { page, pageSize, select, search, sort, where } = getSpecimenQueryParams(event)
    
  const permissions = getCurrentUserPermissions(event)
  const resources = getAuthorizedResources(event, r => /^specimen(:\w)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  
  return sha256base64(objectHash({
    page,
    pageSize,
    search,
    permissions,
    select: select.sort().filter(field => !authFields.length || authFields.includes(field)),
    sort: sort.filter(([field]) => !authFields.length || authFields.includes(field)),
    where: Object.fromEntries(Object.entries(where).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).filter(([field]) => !authFields.length || authFields.includes(field))),
  }))
}
