import type { Permission } from '@unb-libraries/nuxt-layer-entity'
import type { H3Event, Session, HTTPMethod } from 'h3'

export function useCurrentServerSession(event: H3Event) {
  const { name } = useServerSessionConfig()
  return event.context.sessions?.[name] as Session<{
    user: string
    permissions: string[]
    validUntil: number
  }>
}

export function getCurrentUserPermissions(event: H3Event, options?: Partial<{ action: `read` | `write` | `update` | `delete` | `method` | `*` }>) {
  const session = useCurrentServerSession(event)

  function getHttpMethodAction(method: HTTPMethod) {
    switch (method) {
      case `POST`: return `create`
      case `PUT`: return `update`
      case `DELETE`: return `delete`
      case `GET`:
      default: return `read`
    }
  }
  const action = options?.action === `method`
    ? getHttpMethodAction(event.method)
    : options?.action ?? `*`

  return session.data.permissions
    .map(p => createPermission(p as string))
    .filter(p => action === `*` || p.action === action)
    .reduceRight((acc, p) => ({ ...acc, [p.resource]: p }), {} as Record<string, Permission>)
}

export function useServerSessionConfig() {
  return {
    ...useRuntimeConfig().public.session,
    ...useRuntimeConfig().session,
  }
}
