export function useReturnUrl(options?: { fallback: string }) {
  const state = useState<string[]>('return', () => [])
  return {
    addReturnUrl: (url: string) => {
      state.value = [...state.value, url]
    },
    returnUrl: computed(() => state.value[state.value.length - 1] ?? options?.fallback ?? '/'),
    setReturnUrl: (url: string, index?: number) => {
      if (index === undefined) {
        state.value = [url]
      } else {
        state.value = [...state.value.slice(0, index), url, ...state.value.slice(index + 1)]
      }
    },
  }
}