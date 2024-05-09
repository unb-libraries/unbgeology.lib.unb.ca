<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-for="[destination, label] in actions" :key="destination" :to="destination" class="form-action form-action-submit p-2 font-normal">
        {{ label }}
      </NuxtLink>
    </template>

    <div v-if="searchable" class="relative flex w-full flex-row space-x-2">
      <div class="form-field w-full">
        <label class="sr-only" for="search">Search</label>
        <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 form-input form-input-text grow p-2 placeholder:italic">
      </div>
      <button v-if="selectedColumns" id="button-columns" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="columnMenuVisible = !columnMenuVisible">
        Columns
      </button>
      <button id="button-sort" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="sortMenuVisible = !sortMenuVisible">
        Sort
      </button>
      <button id="button-filter" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="filterMenuVisible = !filterMenuVisible">
        Filter
      </button>

      <PvContextualDropdown v-if="toggableColumns.length > 0" v-model="columnMenuVisible" trigger-id="button-columns" class="bg-primary border-primary-60/40 right-0 top-12 z-50 w-96 rounded-md border p-4">
        <PvEntityTableColumnsMenu :columns="toggableColumns" @change="onToggleColumn" />
      </PvContextualDropdown>

      <PvContextualDropdown v-model="sortMenuVisible" trigger-id="button-sort" class="bg-primary border-primary-60/40 right-0 top-12 z-50 w-96 rounded-md border p-4" @click.stop.prevent="sortMenuVisible = !sortMenuVisible">
        <PvSortableEntityPropertyList
          :sorted-items="sortedColumns"
          :unsorted-items="unsortedColumns"
          class="space-y-1"
          list-class="space-y-1"
          item-class="rounded-md"
          sorted-item-class="bg-primary-80 hover:bg-primary-80/60"
          unsorted-item-class="bg-primary-80/60 hover:bg-primary-80/80 cursor-pointer"
          @moved="onItemSorted"
          @item-changed="onItemSorted"
        />
      </PvContextualDropdown>

      <PvContextualDropdown v-model="filterMenuVisible" trigger-id="button-filter" class="bg-primary border-primary-60/40 right-0 top-12 z-50 w-96 space-y-4 rounded-md border p-6" @click.prevent.stop="filterMenuVisible = !filterMenuVisible">
        <div class="form-field">
          <label class="form-label" for="filter-category">Role</label>
          <PvInputDropdown v-model="role" :options="roles" />
        </div>
        <div class="space-x-2">
          <button type="submit" class="form-action form-action-submit" @click.prevent="onSubmitFilterForm()">
            Apply
          </button>
          <a class="cursor-pointer p-2 hover:underline" @click.prevent="onResetFilterForm">Reset</a>
        </div>
      </PvContextualDropdown>
    </div>

    <div>
      <PvEntityTable :entities="entities" :columns="selectedColumns">
        <template v-for="[id] in columns" #[id]="{ value, entity }">
          <slot :name="`column-${id}`" :value="value" :entity="entity">
            {{ value }}
          </slot>
        </template>
      </PvEntityTable>

      <div class="flex flex-row justify-between">
        <span v-if="list?.total" class="italic">
          {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list?.total, entityType.toLowerCase(), `${entityType.toLowerCase()}s`) }}
        </span>
        <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'

interface Column {
  label: string
  toggable: boolean
  selected: boolean
  sort: 1 | 0 | -1 | false
}

const props = defineProps<{
  entityType: string
  bundle?: string
  actions:(string | [string, string])[]
  columns:(string | [string, string] | [string, Partial<Column>])[] | Record<string, Partial<Column>>
  searchable?: boolean
}>()

const defaultColumn = (id: string, label?: string) => ({
  label: label ?? id.substring(0, 1).toUpperCase() + id.substring(1).toLowerCase(),
  toggable: true,
  selected: true,
  sort: 0 as 1 | 0 | -1 | false,
})

const columns = ref<[string, Column][]>(
  Array.isArray(props.columns)
    ? props.columns.map((col) => {
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
    : Object.entries(props.columns).map(([id, col]) => [id, {
      ...defaultColumn(id),
      ...col,
    }]),
)

const { list, entities, query } = await fetchEntityList(props.entityType, {
  select: columns.value.map(([id]) => id),
})
const { filter, page, pageSize, search, sort } = query

const onToggleColumn = ([id, , selected]: [string, string, boolean]) => {
  const index = columns.value.findIndex(([key]) => key === id)
  if (index >= 0) {
    columns.value[index][1].selected = selected
    columns.value = [...columns.value]
  }
}

const actions = computed(() => props.actions.map(action => Array.isArray(action) ? action : [action, `${action.split(`/`).at(-1)} ${props.entityType}`]))

// Columns
const toggableColumns = computed<[string, string, boolean][]>(() => columns.value.filter(([_, { toggable }]) => toggable).map(([id, { label, selected }]) => [id, label, selected]))
const selectedColumns = computed<[string, string][]>(() => columns.value.filter(([, { selected }]) => selected).map(([id, { label }]) => [id, label]))
const columnMenuVisible = ref(false)

// Sort
const sortableColumns = computed<[string, [string, 1 | 0 | -1]][]>(() => columns.value
  .filter(([, { sort }]) => sort !== false)
  .map(([id, { label, sort }]) => [id, [label, sort as 1 | 0 | -1]]),
)
const sortedColumns = computed(() => sort.value
  .map<[string, 1 | -1]>(key => [key.replace(/^-/, ``), key.startsWith(`-`) ? -1 : 1])
  .map<[string, [string, 1 | -1]]>(([key, direction]) => [key, [columns.value.find(([id]) => id === key)?.[1].label ?? ``, direction]]))
const unsortedColumns = computed<[string, string][]>(() => sortableColumns.value
  .filter(([id]) => !sort.value.includes(id) && !sort.value.includes(`-${id}`))
  .map(([id, [label]]) => [id, label]))
const sortMenuVisible = ref(false)

const onItemSorted = (item: [string, [string, 1 | 0 | -1]], items: [string, [string, 1 | 0 | -1]][]) => {
  columns.value = columns.value.map(([id, column]) => id !== item[0] ? [id, column] : [id, { ...column, sort: items.find(([key]) => key === id)?.[1][1] ?? 0 }])
  sort.value = items.filter(([, [, direction]]) => direction).map(([id, [, direction]]) => `${direction < 0 ? `-` : ``}${id}`)
}

// Filter
const filterMenuVisible = ref(false)
const roles = [`sudo`, `sysadmin`, `migrator`, `curator`, `editor`, `public`]
const role = ref()

const onSubmitFilterForm = () => {
  if (role.value) {
    filter.value = [[`roles`, FilterOperator.EQUALS, role.value]]
  } else {
    filter.value = []
  }
}

const onResetFilterForm = () => {
  filter.value = []
  role.value = undefined
}
</script>
