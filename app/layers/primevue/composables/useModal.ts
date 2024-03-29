import { type DynamicContent } from "../types"

export default function () {
  const state = useState<DynamicContent | null>(`modal`, () => null)

  const close = () => {
    state.value = null
  }

  const isOpen = computed(() => state.value !== null)

  return {
    isOpen,
    content: state,
    close,
  }
}
