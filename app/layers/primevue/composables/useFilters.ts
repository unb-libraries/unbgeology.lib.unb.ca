import { type Filter, type FilterGroup, FilterOperator, type Transformer } from "@unb-libraries/nuxt-layer-entity"

function createFilterMap(initialFilters?: Map<string, Map<FilterOperator, Set<string>>> | Filter[]): FilterGroup {
  const has = (id: string, op?: FilterOperator, value?: string) => {
    return filters.has(id) && (!op || (filters.get(id)!.has(op) && (!value || filters.get(id)!.get(op)!.has(value))))
  }

  function get(id: string): Map<FilterOperator, Set<string>> | undefined
  function get(id: string, op: FilterOperator): Set<string> | undefined
  function get(id: string, op?: FilterOperator): Map<FilterOperator, Set<string>> | Set<string> | undefined {
    if (id && op) {
      return filters.has(id) && filters.get(id)!.has(op) ? filters.get(id)!.get(op) : new Set<string>()
    } else {
      return filters.has(id) ? filters.get(id) : new Map<FilterOperator, Set<string>>()
    }
  }

  function set(id: string, op: FilterOperator, value: Set<string>) {
    if (!has(id, op)) {
      add(id, op)
    }
    filters.get(id)!.set(op, value)
  }

  const add = (id: string, op?: FilterOperator, value?: string) => {
    if (!filters.has(id)) {
      filters.set(id, new Map())
    }
    if (op && !filters.get(id)!.has(op)) {
      filters.get(id)!.set(op, new Set())
    }
    if (op && value) {
      filters.get(id)!.get(op)!.add(value)
    }
  }

  const remove = (id: string, op?: FilterOperator, value?: string) => {
    if (id && op && value) {
      filters.get(id)!.get(op)!.delete(value)
    } else if (id && op) {
      filters.get(id)!.delete(op)
    } else if (id) {
      filters.delete(id)
    }
  }

  const merge = (filters: Map<string, Map<FilterOperator, Set<string>>> | Filter[]) => {
    if (Array.isArray(filters)) {
      filters.forEach(([id, op, value]) => add(id, op, value))
    } else {
      filters.forEach((ops, id) => {
        ops.forEach((values, op) => {
          values.forEach((value) => {
            add(id, op, value)
          })
        })
      })
    }
  }

  const toArray = () => {
    const arr: Filter[] = []
    filters.forEach((ops, id) => {
      ops.forEach((values, op) => {
        values.forEach((value) => {
          arr.push([id, op, value])
        })
      })
    })
    return arr
  }

  const filters: Map<string, Map<FilterOperator, Set<string>>> = initialFilters instanceof Map ? initialFilters : new Map()
  if (initialFilters && Array.isArray(initialFilters)) {
    merge(initialFilters)
  }

  return {
    has,
    get,
    set,
    add,
    remove,
    toArray,
  }
}

export default function (filters: Ref<Filter[]>) {
  const group = createFilterMap(filters.value)

  const created: (() => void)[] = []

  const create = <T = any>(id: string, op: FilterOperator, transformer: Transformer<T>) => {
    const raw = group.get(id, op) as Set<string> | undefined
    const value = ref(transformer.input(raw ? [...raw] : []))

    created.push(() => {
      if (!transformer.empty(value.value as T)) {
        const transformed = transformer.output(value.value as T)
        group.set(id, op, new Set<string>(transformed))
      } else if (group.has(id, op)) {
        group.remove(id, op)
      }
    })

    return value
  }

  const apply = () => {
    created.forEach(apply => apply())
    filters.value = group.toArray()
  }

  return {
    create,
    apply,
  }
}
