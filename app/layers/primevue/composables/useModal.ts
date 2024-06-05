import type { Component } from "nuxt/schema"
// import type { JsxElement } from "typescript"
import { type DynamicContent } from "../types"

export default function () {
  const state = useState<DynamicContent | null>(`modal`, () => null)

  const setContent = (component: JsxElement) => {
    state.value = component
  }

  const close = () => {
    state.value = null
  }

  const isOpen = computed(() => state.value !== null)

  return {
    isOpen,
    content: state,
    setContent,
    close,
  }
}
