import type { Permission } from '@unb-libraries/nuxt-layer-entity'
import type { H3Event, HTTPMethod } from 'h3'
import { type UserSession } from '../../types/session'

export function useCurrentServerSession(event: H3Event) {
  const { name } = useServerSessionConfig()
  return event.context.sessions?.[name] as UserSession
}

export async function createUserSession(event: H3Event, username: string, options?: Partial<{ sessionName: string }>) {
  const { name } = useServerSessionConfig()
  const { sessionName } = options ?? { sessionName: name }

  let responseCookie
  await $fetch(`/api/session`, {
    method: `POST`,
    body: { username, sessionName },
    headers: getProxyRequestHeaders(event),
    onResponse: (res) => {
      responseCookie = res.response.headers
        .getSetCookie()
        .findLast(cookie => cookie.startsWith(`${sessionName}=`))
    },
  })

  return responseCookie ?? `${sessionName}=`
}

export function getCurrentUserPermissions(event: H3Event, options?: Partial<{ action: `read` | `write` | `update` | `delete` | `method` | `*` }>) {
  const session = useCurrentServerSession(event)

  function getHttpMethodAction(method: HTTPMethod) {
    switch (method) {
      case `POST`: return `create`
      case `PATCH`:
      case `PUT`: return `update`
      case `DELETE`: return `delete`
      case `GET`:
      default: return `read`
    }
  }
  const action = !options?.action || options?.action === `method`
    ? getHttpMethodAction(event.method)
    : `*`

  return session.data.permissions
    .map(p => createPermission(p as string))
    .filter(p => action === `*` || p.action === action)
    .reduceRight((acc, p) => ({
      ...acc,
      [p.resource]: {
        resource: p.resource,
        action: p.action,
        fields: [...acc[p.resource]?.fields ?? [], ...p.fields ?? []],
      },
    }), {} as Record<string, Permission>)
}

export function getAuthorizedResources(event: H3Event, match?: (res: string) => boolean, options?: Parameters<typeof getCurrentUserPermissions>[1]) {
  return Object.values(getCurrentUserPermissions(event, options?.action && { action: options?.action }))
    .filter(({ resource }) => !match || match(resource))
    .map(({ resource }) => resource)
}

export function getAuthorizedFields(event: H3Event, ...resources: string[]) {
  return Object.values(getCurrentUserPermissions(event))
    .filter(({ resource }) => resources.includes(resource))
    .map<string[]>(({ fields }) => fields ?? [])
    .reduceRight((all, some) => all.concat(...some), [])
    .filter((field, i, arr) => arr.indexOf(field) === i) ?? []
}

export function useServerSessionConfig() {
  return {
    ...useRuntimeConfig().public.session,
    ...useRuntimeConfig().session,
  }
}
