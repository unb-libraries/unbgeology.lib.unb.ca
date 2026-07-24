export function useReturnUrl(url?: string) {
  const state = useState('return', () => '')
  const returnUrl = state.value
  if (url) {
    state.value = url
  } else {
    state.value = useRoute().fullPath
  }
  return returnUrl
}