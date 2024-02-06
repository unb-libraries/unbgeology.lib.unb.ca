<template>
  <header class="mb-6 space-y-6">
    <div class="flex flex-row space-x-8">
      <h1 id="title" class="text-2xl">
        Specimens
      </h1>
      <div class="grow space-x-2 text-right">
        <NuxtLink to="/dashboard/specimens/create/?category=fossil" class="form-action form-action-submit p-2 font-normal">
          Create Fossil
        </NuxtLink>
        <NuxtLink to="/dashboard/specimens/create/?category=mineral" class="form-action form-action-submit p-2 font-normal">
          Create Mineral
        </NuxtLink>
        <NuxtLink to="/dashboard/specimens/create/?category=rock" class="form-action form-action-submit p-2 font-normal">
          Create Rock
        </NuxtLink>
      </div>
    </div>

    <div class="relative flex w-full flex-row space-x-2">
      <div class="form-field w-full">
        <label class="sr-only" for="search">Search</label>
        <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 form-input form-input-text grow p-2 placeholder:italic">
      </div>
      <button id="button-sort" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="sortMenuVisible = !sortMenuVisible">
        Sort
      </button>
      <button id="button-columns" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="columnMenuVisible = !columnMenuVisible">
        Columns
      </button>

      <div v-if="sortMenuVisible" id="menu-sort" v-on-window="hideSortMenu" class="bg-primary border-primary-60/40 absolute right-0 top-12 w-96 rounded-md border p-6">
        <div class="form-field">
          <div v-for="column in sortOptions" :key="(column[0])">
            <a class="cursor-pointer hover:underline" @click.stop.prevent="sortBy(column[0])">{{ column[1] }}</a>
          </div>
        </div>
      </div>

      <div v-if="columnMenuVisible" id="menu-columns" v-on-window="hideColumnMenu" class="bg-primary border-primary-60/40 absolute right-0 top-12 w-96 rounded-md border p-6">
        <div class="form-field">
          <div v-for="column in columnsOptions" :key="(column[0])">
            <PvCheckbox
              :id="`column-${column[0]}`"
              v-model="column[2]"
              :label="column[1]"
              :name="`column-${column[0]}`"
              class="form-input-checkbox rounded-lg p-1"
            />
          </div>
        </div>
      </div>
    </div>
  </header>

  <EntityTable
    v-model="selected"
    class="border-primary-60/75 w-full border-b"
    header-cell-class="group"
    row-class="even:dark:bg-primary-80/20 hover:bg-accent-dark/20 even:dark:hover:bg-accent-dark/20"
    :entities="specimens"
    :columns="columnsOptions.filter(([id, label, selected]) => selected).map(([id, label]) => [id, label])"
    :multi-select="true"
    selected-row-class="dark:bg-accent-dark/40 even:dark:bg-accent-dark/40 hover:dark:bg-accent-dark/60 even:hover:dark:bg-accent-dark/60"
  >
    <template #id="{ entity: specimen }">
      <NuxtLink :to="`/dashboard/specimens/${specimen.id.toLowerCase()}`" class="hover:underline">
        {{ specimen.id.toUpperCase() }}
      </NuxtLink>
    </template>
    <template #category="{ entity: specimen }">
      {{ specimen.category.substring(0, 1).toUpperCase() + specimen.category.substring(1).toLowerCase() }}
    </template>
    <template #classification="{ entity: specimen }">
      <template v-if="specimen.classification">
        {{ specimen.classification.label }}
      </template>
    </template>
    <template #measurements="{ entity: specimen }">
      <ol v-if="specimen.measurements?.length">
        <li v-for="(dimensions, index) in specimen.measurements.map(m => m.dimensions)" :key="index">
          {{ dimensions.map(d => `${d / 10}cm`).join(` x `) }}
        </li>
      </ol>
      <span v-else />
    </template>
    <template #pieces="{ entity: specimen}">
      {{ specimen.pieces }}{{ specimen.partial ? ` (P)` : `` }}
    </template>
  </EntityTable>

  <div class="mt-2 flex flex-row justify-between">
    <span v-if="list?.total" class="italic">
      {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list?.total, `specimen`, `specimens`) }}
    </span>
    <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" />
  </div>
</template>

<script setup lang="ts">
import { type EntityJSON } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard`,
})

const { list, entities: specimens, query } = await fetchEntityList<Specimen>(`Specimen`)
const { search, page, pageSize, sort } = query
const columns = ref<(string | [string, string])[]>([
  [`id`, `ID`],
  [`category`, `Category`],
  [`classification`, `Classification`],
  [`pieces`, `Pieces`],
  [`measurements`, `Dimensions`],
])

const columnMenuVisible = ref(false)
const columnsOptions = ref<[string, string, boolean][]>(columns.value.map(([id, label], index) => [id, label, index < 4]))

const sortMenuVisible = ref(false)
const sortOptions = computed<[string, string, number, 0 | 1 | -1][]>({
  get() {
    return columns.value.map<[string, string, number, 0 | 1 | -1]>(([id, label]) => {
      const index = sort.value.findIndex(i => i === id || i === `-${id}`)
      const column = sort.value[index]
      return [id, label, index >= 0 ? index : Number.MAX_VALUE, column && !column.startsWith(`-`) ? 1 : column ? -1 : 0]
    }).sort(({ 2: orderA }, { 2: orderB }) => orderA - orderB)
  },
  set(value: [string, string, number, 0 | 1 | -1][]) {
    sort.value = value
      .filter(({ 2: order }) => order < Number.MAX_VALUE)
      .sort(({ 2: orderA }, { 2: orderB }) => orderA - orderB)
      .map(({ 0: id, 3: direction }) => `${direction === -1 ? `-` : ``}${id}`)
  },
})

const sortBy = (id: string) => {
  const index = sortOptions.value.findIndex(([i]) => i === id)
  if (index > 0) {
    const options = sortOptions.value
    options[index][2] = -1
    sortOptions.value = options
  }
}

const hideSortMenu = (event: Event) => {
  if (event.target && !isTarget(event.target, `button-sort`) && !isTarget(event.target, `menu-sort`)) {
    sortMenuVisible.value = false
  }
}

const selected = ref<EntityJSON<Specimen>[]>([])

const isTarget = (el: HTMLElement, id: string) => el.id === id ? true : el.parentElement ? isTarget(el.parentElement, id) : false

const hideColumnMenu = (event: Event) => {
  if (event.target && !isTarget(event.target, `button-columns`) && !isTarget(event.target, `menu-columns`)) {
    columnMenuVisible.value = false
  }
}
</script>
