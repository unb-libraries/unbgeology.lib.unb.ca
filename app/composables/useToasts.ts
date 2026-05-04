import { type Component } from "vue"

export interface ToastOptions {
  type: `info` | `success` | `warning` | `error`
  duration: number
}

export default function () {
  const Toasts = useState<Record<string, [Component, ToastOptions]>>(`toasts`, () => ({}))
  return {
    toasts: Toasts,
    createToast: (id: string, content: Component, options?: Partial<ToastOptions>) => {
      Toasts.value = { ...Toasts.value, [id]: [content, { duration: -1, type: `info`, ...(options ?? {}) }] }
    },
    removeToast: (id: string) => {
      if (Toasts.value[id]) {
        Toasts.value = Object.fromEntries(Object.entries<[Component, ToastOptions]>(Toasts.value).filter(([key]) => key !== id))
      }
    },
  }
}
