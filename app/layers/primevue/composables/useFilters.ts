import { FilterOperator, type Filter } from '@unb-libraries/nuxt-layer-entity'

type FilterMap = Map<string, Map<FilterOperator, Set<string>>>

export default function (initialFilters?: FilterMap | Filter[]) {
  const add = ([id, op, value]: Filter) => {
    if (!filterMap.has(id)) {
      filterMap.set(id, new Map())
    }
    if (!filterMap.get(id)!.has(op)) {
      filterMap.get(id)!.set(op, new Set())
    }
    if (value) {
      filterMap.get(id)!.get(op)!.add(value)
    }
  }

  const remove = ([id, op, value]: Filter) => {
    if (filterMap.has(id) && filterMap.get(id)!.has(op) && value) {
      filterMap.get(id)!.get(op)!.delete(value)
    }
  }

  const merge = (filters: FilterMap | Filter[]) => {
    if (Array.isArray(filters)) {
      filters.forEach(add)
    } else {
      filters.forEach((ops, id) => {
        ops.forEach((values, op) => {
          values.forEach((value) => {
            add([id, op, value])
          })
        })
      })
    }
  }

  const filterMap: FilterMap = reactive(new Map())
  if (initialFilters) {
    merge(initialFilters)
  }

  const toArray = () => {
    const filters: Filter[] = []
    filterMap.forEach((ops, id) => {
      ops.forEach((values, op) => {
        values.forEach((value) => {
          filters.push([id, op, value])
        })
      })
    })
    return filters
  }

  return {
    add,
    remove,
    merge,
    toArray,
  }
}
