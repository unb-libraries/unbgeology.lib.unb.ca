import type { Entity } from "@unb-libraries/nuxt-layer-entity"
import type { EntitySchema } from "../utils/entitySchema"

export interface Column {
  id: string
  label: string
  toggable: boolean
  selected: boolean
  sortable: 1 | 0 | -1 | false
  permission: string
}

function columnTransform(definition: (string | [string, string | Partial<Omit<Column, `id`>>])[] | Record<string, string | Partial<Omit<Column, `id`>>>) {
  const fromArray = (definition: (string | [string, string | Partial<Omit<Column, `id`>>])[]) => definition
    .map(col => Array.isArray(col) ? col : [col, col[0].toUpperCase() + col.substring(1).toLowerCase()])
    .map(([id, labelOrColumn]) => typeof labelOrColumn === `string` ? ({ id, label: labelOrColumn }) : ({ id, ...labelOrColumn }))
  return Object.entries(Array.isArray(definition) ? fromArray(definition) : definition).map(([id, col]) => ({
    id,
    label: id.substring(0, 1).toUpperCase() + id.substring(1).toLowerCase(),
    toggable: true,
    selected: true,
    sortable: 0,
    ...(typeof col === `string` ? { label: col } : col),
  }))
}

export function defineColumns(definition: (string | [string, string | Partial<Omit<Column, `id`>>])[] | Record<string, string | Partial<Omit<Column, `id`>>>) {
  return columnTransform(definition)
}

export async function useEntityColumns(entityType: string, definition: (string | [string, string | Partial<Omit<Column, `id`>>])[] | Record<string, string | Partial<Omit<Column, `id`>>>, options?: Partial<{ authorized: boolean }>) {
  const columns = await Promise.all(columnTransform(definition).map(col => ({ ...col, permission: `read:${entityType.toLowerCase()}:${col.id}` })).map(async col => ({ ...col, hasP: await hasPermission(col.permission) || await hasPermission(`read:${entityType.toLowerCase()}:*`) })))
  const authorizedColumns = options?.authorized
    ? columns.filter(({ hasP }) => hasP)
    : columns
  return useColumns(authorizedColumns.map(({ id, ...col }) => [id, col] as [string, Omit<Column, `id`>]))
}

export function useColumns(definition: (string | [string, string | Partial<Omit<Column, `id`>>])[] | Record<string, string | Partial<Omit<Column, `id`>>>) {
  const columns = columnTransform(definition)
  const toggleableColumns = ref(columns.filter(({ toggable }) => toggable).map<[string, string, boolean]>(({ id, label, selected }) => [id, label, selected]))
  const selectedColumns = computed(() => toggleableColumns.value.filter(([, , selected]) => selected).map<[string, string]>(([id, label]) => [id, label]))
  const sortableColumns = ref(columns.filter(({ sortable }) => sortable !== false).map<[string, [string, 1 | 0 | -1]]>(({ id, label, sortable }) => [id, [label, sortable as 1 | 0 | -1]]))
  const sortedByColumnIDs = computed(() => (sortableColumns.value.filter(([, [, sortable]]) => sortable)).map(([id, [, sortable]]) => sortable > 0 ? id : `-${id}`))

  const toggle = (id: string) => {
    const index = toggleableColumns.value.findIndex(([key]) => key === id)
    if (index >= 0) {
      const [,, selected] = toggleableColumns.value[index]
      toggleableColumns.value[index][2] = !selected
      toggleableColumns.value = [...toggleableColumns.value]
    }
  }

  return {
    columns: Object.fromEntries(columns.map(col => [col.id, col])),
    toggleableColumns,
    selectedColumns,
    toggle,
    sortableColumns,
    sortedByColumnIDs,
  }
}

export function useToggleableColumns<E extends Entity = Entity>(schema: EntitySchema<E>, options?: Partial<{ defaultValue: boolean | (keyof E)[] | ((id: keyof E) => boolean) }>) {
  const getDefaultValue = (id: keyof E) => Array.isArray(options?.defaultValue)
    ? options.defaultValue.includes(id)
    : typeof options?.defaultValue === `function`
      ? options.defaultValue(id)
      : !options?.defaultValue

  const columns = ref<[keyof E, string, boolean][]>(schema
    .filter(({ toggable }) => toggable)
    .entries.map(([id, { label }]) => [id, label, getDefaultValue(id)]))

  return {
    columns,
    selected: computed(() => columns.value
      .filter(([, , selected]) => selected)
      .map<[keyof E, string]>(([id, label]) => [id as keyof E, label])),
    toggle: (id: string) => {
      const index = columns.value.findIndex(([key]) => key === id)
      if (index >= 0) {
        const [,, selected] = columns.value[index]
        columns.value[index][2] = !selected
        columns.value = [...columns.value]
      }
    },
  }
}

export function useSortableColumns<E extends Entity = Entity>(schema: EntitySchema<E>, options?: Partial<{ defaultSort: keyof E | (keyof E)[] | [keyof E, Sort][] | Sort }>) {
  const getDefaultValue = (id: keyof E): Sort => {
    if (Array.isArray(options?.defaultSort)) {
      const item = options.defaultSort.find(item => Array.isArray(item) ? item[0] === id : item === id)
      return Array.isArray(item) ? item[1] : 0
    } else if (typeof options?.defaultSort === `string`) {
      return options?.defaultSort === id ? 1 : 0
    } else if (typeof options?.defaultSort === `number`) {
      return options?.defaultSort as Sort
    } else {
      return 0
    }
  }

  const columns = ref<[keyof E, string, Sort][]>(schema
    .filter(({ sort }) => sort !== false)
    .entries.map(([id, { label }]) => [id, label, getDefaultValue(id)]))

  const ranked = computed(() => columns.value.filter(([,, sort]) => sort !== 0))
  const rankedIDs = computed(() => ranked.value.map(([id,, sort]) => sort > 0 ? id : `-${String(id)}`))
  const toggle = (id: string) => {
    const index = columns.value.findIndex(([key]) => key === id)
    if (index >= 0) {
      const [,, sort] = columns.value[index]
      columns.value[index][2] = sort === 1 ? -1 : sort === -1 ? 0 : 1
      columns.value = [...columns.value]
    }
  }

  return {
    columns,
    ranked,
    rankedIDs,
    toggle,
  }
}
