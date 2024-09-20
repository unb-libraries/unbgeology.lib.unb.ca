export interface InputAttributes<T = any> extends Record<keyof T, unknown> {
  id?: string
  name?: string
  class?: string
}

export interface InputTextAttributes extends InputAttributes {
  placeholder?: string
}

export type ThemedComponentProps<T extends string[]> = Partial<{
  theme: Partial<{
    class: Record<T[number], string>
  }>
}>

export type Validator<T> = (value: T) => string | void
export type ValidatedInputProps<T> = {
  required?: boolean
  validators: Validator<T>[]
}
export type ValidatedInputEmits = {
  validated: [valid: boolean, errors?: string[]]
}

export interface ValidatedFieldOptions<T extends string> {
  value: T
  caption: string
}

export interface ValidatorOptions {
  message: string
}
