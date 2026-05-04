import { type Component } from "#imports"
const stack = ref<Component[]>([])

export default function useModal() {
  return {
    content: computed(() => stack.value[0]),
    stack,
    setContent(component: Component) {
      stack.value = [component]
    },
    isOpen: computed(() => stack.value.length > 0),
    stackContent(component: Component) {
      stack.value = [component, ...stack.value]
    },
    unstackContent() {
      stack.value = stack.value.slice(1)
    },
    close() {
      stack.value = []
    },
  }
}
