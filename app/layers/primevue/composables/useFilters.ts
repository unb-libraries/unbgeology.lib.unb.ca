import { defu } from "defu"
import { type Filter, FilterOperator, type Transformer } from "@unb-libraries/nuxt-layer-entity"

export default function (filters: Ref<Filter[]>, options?: { immediate: boolean }) {
  const globalOptions = defu(options, { immediate: false })

  const changes: Map<string, (() => Filter[])> = new Map()

  const create = <T = any>(id: string, op: FilterOperator, transformer: Transformer<T>, options?: { immediate: boolean }) => {
    const { immediate = false } = options ?? globalOptions

    const value = computed({
      get() {
        const value = filters.value.filter(filter => filter[0] === id && filter[1] === op).reduce((acc, [, , value]) => {
          if (value) {
            acc.push(value)
          }
          return acc
        }, [] as string[])
        return transformer.input(value)
      },
      set(value: T) {
        const transformed = transformer.output(value)
        changes.set([id, op].join(`::`), () => {
          if (Array.isArray(transformed)) {
            const filters: Filter[] = transformed.map(value => value ? [id, op, value] : [id, op])
            return filters
          } else {
            return [[id, op]]
          }
        })

        if (immediate) {
          apply([id, op])
        }
      },
    })

    return value
  }

  const apply = (filter?: [string, FilterOperator]) => {
    if (filter) {
      const filterBuilder = changes.get(filter.join(`::`))
      if (filterBuilder) {
        filters.value = [...filters.value.filter(f => f[0] !== filter[0] && f[1] !== filter[1]), ...filterBuilder()]
      }
      changes.delete(filter.join(`::`))
    } else {
      const changedFilters: Filter[] = []
      changes.forEach((builder) => {
        changedFilters.push(...builder())
      })
      filters.value = changedFilters
      changes.clear()
    }
  }

  return {
    create,
    apply,
  }
}
