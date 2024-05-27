import type { PageMeta } from "#app"

type MenuMeta = NonNullable<Required<PageMeta[`menu`]>>

export function getPagesMenu(): MenuMeta[] {
  const { getRoutes } = useRouter()
  const { hasPermission } = useCurrentUser()

  return getRoutes()
    .filter(({ meta }) => !meta?.auth?.permission || hasPermission(meta.auth.permission))
    .map(({ path, meta, name }) => ({
      id: path.substring(1).split(`/`).join(`.`),
      parent: `/${path.substring(1).split(`/`).slice(0, -1).join(`/`)}`,
      name: name?.toString() ?? path.substring(1).split(`/`).at(-1) ?? ``,
      hide: /[:()]/.test(path),
      path,
      weight: 0,
      ...(meta?.menu ?? {}),
    }))
    .filter(({ hide }) => !hide)
}
