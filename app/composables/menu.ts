import type { PageMeta } from "#app"

type MenuMeta = NonNullable<Required<PageMeta[`menu`]>>

export function getPagesMenu(): MenuMeta[] {
  const { getRoutes } = useRouter()
  return getRoutes()
    .filter(({ meta }) => usePermissions(meta?.auth?.permission ?? []).value.length)
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
