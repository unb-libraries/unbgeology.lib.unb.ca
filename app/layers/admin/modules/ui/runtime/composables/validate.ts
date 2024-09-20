import type { Validator, ValidatedFieldOptions } from "#build/types/unb-libraries-nuxt-ui"

export function useValidate<T = any>(validators?: Validator<T>[]) {
  const errors = ref<string[]>([])
  const valid = computed(() => errors.value.length === 0)

  return {
    valid,
    errors,
    validate(value: T) {
      errors.value = (validators ?? [])
        .map((validator) => validator(value) || ``)
        .filter((error) => error)
    },
  }
}

export function useValidationErrors() {
  const vErrors = ref<string[]>([])
  const onValidate = (valid: boolean, errors?: string[]) => {
    vErrors.value = (!valid && errors) || []
  }
  return { errors: vErrors, onValidate }
}

export function useValidatedFormField<T extends string>(options?: Partial<ValidatedFieldOptions<T>>) {
  const value = ref<T>(options?.value as T)
  const caption = ref(options?.caption)
  const { errors, onValidate } = useValidationErrors()
  const captionOrError = computed(() => errors.value?.[0] || caption.value)
  
  return {
    value,
    caption,
    captionOrError,
    errors,
    onValidate,
  }
}
