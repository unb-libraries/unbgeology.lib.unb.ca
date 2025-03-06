import { objectHash, sha256base64 } from 'ohash'
import type { H3Event } from "h3"

export function getSpecimenRequestCacheId(event: H3Event) {
  const { page, pageSize, select, search, sort, where, filter } = getSpecimenQueryParams(event)
    
  const permissions = getCurrentUserPermissions(event)
  const resources = getAuthorizedResources(event, r => /^specimen(:[a-z]+)*$/.test(r))
  const authFields = getAuthorizedFields(event, ...resources)
  
  return sha256base64(objectHash({
    page,
    pageSize,
    search,
    permissions,
    select: select
      .sort()
      .filter(field => !authFields.length || authFields.includes(field)),
    sort: sort
      .filter(([field]) => !authFields.length || authFields.includes(field)),
    where: Object.fromEntries(Object.entries(where)
      .filter(([field]) => !authFields.length || authFields.includes(field))
      .sort(([f1, d1], [f2, d2]) => f1 < f2 ? -1 : f1 > f2 ? 1 : d1 < d2 ? -1 : d1 > d2 ? 1 : 0)),
    filter: filter
      .filter(([field]) => !authFields.length || authFields.includes(field))
      .map(([f, op, v]) => [f, `${op}:${v}`])
      .sort(([f1, o1], [f2, o2]) => f1 < f2 ? -1 : f1 > f2 ? 1 : o1 < o2 ? -1 : o1 > o2 ? 1 : 0),
  }))
}
