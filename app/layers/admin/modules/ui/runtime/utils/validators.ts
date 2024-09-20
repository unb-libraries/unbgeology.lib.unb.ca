import type { ValidatorOptions } from "#build/types/unb-libraries-nuxt-ui"

export const RequiredValidator = (options?: Partial<ValidatorOptions>) => (value: string) => {
  if (!value) {
    return options?.message || `Value is required.`
  }
}

export const PatternValidator = (pattern: RegExp, options?: Partial<ValidatorOptions>) => (value: string) => {
  if (value && !value.match(pattern)) {
    return options?.message || `Value must match ${pattern}.`
  }
}

export const EmailValidator = (options?: Partial<ValidatorOptions>) => {
  return (value: string) =>
    PatternValidator(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: options?.message || `Value must be a valid email` })(value)
}

export const DateValidator = (options?: Partial<ValidatorOptions>) => (value: string) => {
  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return options?.message || `Value must be a valid date.`
  }
}

