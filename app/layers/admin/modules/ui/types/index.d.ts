export interface InputAttributes<T = any> extends Record<keyof T, unknown> {
  id?: string
  name?: string
  class?: string
}

export type ThemedComponentProps<T extends string[]> = Partial<{
  theme: Partial<{
    class: Record<T[number], string>
  }>
}>

