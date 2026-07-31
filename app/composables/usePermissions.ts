export default function usePermissions(required?: string | string[] | RegExp | RegExp[]) {
  return computed(() => {
    const permissions = useUserSession().session.value?.permissions ?? []
    if (!required) {
      return permissions
    }

    const pattern = required instanceof RegExp
      ? [required]
      : Array.isArray(required)
        ? required.map(RegExp)
        : [RegExp(required)]
    return permissions.filter(p => pattern.every(r => r.test(p)))
  })
}