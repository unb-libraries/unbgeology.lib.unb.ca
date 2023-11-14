import { type EntityJSONBody, type Entity } from "layers/base/types/entity"

export const useEntityValidate = <E extends Entity = Entity> (entity: Ref<EntityJSONBody<E>>) => {
  const errors = ref({} as Record<PropertyKey, string>)
  return {
    validateField(field: keyof E, validator: (value: any, previousValue?: any) => void | string | Promise<void | string>) {
      if (process.client) {
        let validatorId: number | null = null
        watch(() => entity.value[field as keyof EntityJSONBody<E>], (value, previousValue) => {
          if (validatorId) {
            window.clearTimeout(validatorId)
          }
          validatorId = window.setTimeout(async () => {
            const error = await validator(value, previousValue)
            if (typeof error === `string`) {
              errors.value[field] = error
            } else {
              delete errors.value[field]
            }
            validatorId = null
          }, 300)
        })
      }
    },
    errors,
  }
}
