export interface Column {
  id: string
  label: string
  toggable: boolean
  selected: boolean
  sortable: 1 | 0 | -1 | false
}

export default function (definition: (string | [string, string | Partial<Omit<Column, `id`>>])[] | Record<string, string | Partial<Omit<Column, `id`>>>) {
  const fromArray = (definition: (string | [string, string | Partial<Omit<Column, `id`>>])[]) => definition
    .map(col => Array.isArray(col) ? col : [col, col[0].toUpperCase() + col.substring(1).toLowerCase()])
    .map(([id, labelOrColumn]) => typeof labelOrColumn === `string` ? ({ id, label: labelOrColumn }) : ({ id, ...labelOrColumn }))

  const columns = Object.entries(Array.isArray(definition) ? fromArray(definition) : definition).map(([id, col]) => ({
    id,
    label: id.substring(0, 1).toUpperCase() + id.substring(1).toLowerCase(),
    toggable: true,
    selected: true,
    sortable: 0,
    ...(typeof col === `string` ? { label: col } : col),
  }))

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
