export interface Column {
  id: string
  label: string
  toggable: boolean
  selected: boolean
  sort: number | false
}

const defaultColumn = (id: string, label?: string) => ({
  id,
  label: label ?? id.substring(0, 1).toUpperCase() + id.substring(1).toLowerCase(),
  toggable: true,
  selected: true,
  sort: 0 as 1 | 0 | -1 | false,
})

export default function (definition: Record<string, Partial<Column>>) {
  const columns = ref<[string, Column][]>(
    Array.isArray(definition)
      ? definition.map((col) => {
        if (Array.isArray(col)) {
          const [id, labelOrColumn] = col
          if (typeof labelOrColumn === `string`) {
            return [id, {
              ...defaultColumn(id, labelOrColumn),
            }]
          } else {
            return [id, {
              ...defaultColumn(id),
              ...labelOrColumn,
            }]
          }
        } else {
          return [col, {
            ...defaultColumn(col),
          }]
        }
      })
      : Object.entries(definition).map(([id, col]) => [id, {
        ...defaultColumn(id),
        ...col,
      }]),
  )

  const toggableColumns = computed(() => columns.value.filter(([_, { toggable }]) => toggable).map(([, column]) => column))
  const selectedColumns = computed(() => columns.value.filter(([, { selected }]) => selected).map(([, column]) => column))
  const toggle = (id: string) => {
    const index = columns.value.findIndex(([key]) => key === id)
    if (index >= 0) {
      const selected = columns.value[index][1].selected
      columns.value[index][1].selected = !selected
      columns.value = [...columns.value]
    }
  }

  const sortableColumns = computed<[string, [string, 1 | 0 | -1]][]>(() => columns.value
    .filter(([, { sort }]) => sort !== false)
    .map(([id, { label, sort }]) => [id, [label, sort as 1 | 0 | -1]]),
  )

  const sortedByColumns = computed(() => columns.value
    .filter(([, { sort }]) => sort !== false && sort !== 0)
    .sort(([, { sort: a }], [, { sort: b }]) => Math.abs(a as number) - Math.abs(b as number))
    .map(([, column]) => column as Omit<Column, `sort`> & { sort: 1 | -1 }))

  const unsortedColumns = computed(() => columns.value
    .filter(([, { sort }]) => sort === 0)
    .map(([, column]) => column as Omit<Column, `sort`> & { sort: 0 }))

  function sortBy(...ids: string[]): void {
    const items: [string, 1 | -1][] = ids.map(id => id.startsWith(`-`) ? [id.substring(1), -1] : [id, 1])
    columns.value = columns.value.map(([id, column]) => {
      const { sort } = column
      if (sort === false) {
        return [id, column]
      }

      const index = items.findIndex(([key]) => key === id)
      if (index < 0) {
        return [id, { ...column, sort: 0 }]
      }

      const [, direction] = items[index]
      const rank = direction * (index + 1)

      return [id, { ...column, sort: rank }]
    })
  }

  return {
    columns,
    toggableColumns,
    selectedColumns,
    toggle,
    sortableColumns,
    sortedByColumns,
    unsortedColumns,
    sortBy,
  }
}
