export type SaveStatus = `idle` | `saving` | `saved`

/**
 * Tracks the state of a save operation: `saving` while it runs, `saved` for a
 * few seconds after it succeeds, `idle` otherwise.
 */
export function useSaveStatus(resetAfter = 5000) {
  const status = ref<SaveStatus>(`idle`)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function track<T>(fn: () => Promise<T>, succeeded: (result: T) => boolean = Boolean): Promise<T> {
    clearTimeout(timer)
    status.value = `saving`
    try {
      const result = await fn()
      if (succeeded(result)) {
        status.value = `saved`
        timer = setTimeout(() => status.value = `idle`, resetAfter)
      } else {
        status.value = `idle`
      }
      return result
    } catch (e) {
      status.value = `idle`
      throw e
    }
  }

  onScopeDispose(() => clearTimeout(timer))

  return { status, track }
}
