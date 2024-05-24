export function getPagesMenu() {
  const { getRoutes } = useRouter()
  const { hasPermission } = useCurrentUser()
  return getRoutes()
    .filter(({ meta }) => !meta?.auth?.permission || hasPermission(meta.auth.permission))
    .map(({ path, meta, name }) => ({
      id: path.substring(1).split(`/`).join(`.`),
      parent: path.substring(1).split(`/`).slice(0, -1).join(`.`),
      name,
      hide: /[:()]/.test(path),
      path,
      weight: 0,
      ...(meta?.menu ?? {}),
    }))
    .sort((a, b) => a.parent < b.parent ? -1 : a.parent > b.parent ? 1 : a.weight - b.weight)
    .filter(({ hide }) => !hide)
}
