import type { InputAttributes } from "#build/types/unb-libraries-nuxt-ui"

export function useInputAttrs<T extends InputAttributes = InputAttributes>(): T {
  let { id, name, ...attrs } = useAttrs() as T
  id ||= `input-${name || useId()}`
  name ||= (id.match(/input-.*/) && id.substring(6)) || id
  return { id, name, ...attrs } as T
}
