import type { FilterOperator } from "@unb-libraries/nuxt-layer-entity"

export default function<T extends PropertyKey> (definition: Record<T, FilterOperator>) {
  const filters = reactive(Object.fromEntries(Object
    .entries<FilterOperator>(definition)
    .map<[T, { op: FilterOperator, value: any }]>(([key, op]) => [key as T, { op, value: undefined }])) as Record<T, { op: FilterOperator, value: any }>)

  const modified = computed(() => Object
    .fromEntries(Object
      .entries(filters)
      .filter(([, { value }]) => value !== undefined)))

  function reset() {
    Object.keys(filters).forEach((key) => {
      // @ts-ignore
      filters[key as T].value = undefined
    })
  }

  return {
    filters,
    modified,
    reset,
  }
}
