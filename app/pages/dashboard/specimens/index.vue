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

      <div v-if="filterMenuVisible" id="menu-filter" v-on-window="hideFilterMenu" class="bg-primary border-primary-60/40 absolute right-0 top-12 w-96 rounded-md border p-6">
        <div class="form-field">
          <label class="form-label" for="filter-category">Category</label>
          <PvInputSelect
            v-model="category"
            name="filter-category"
            class="form-input form-input-select rounded-lg p-1"
            :options="[[`fossil`, `Fossil`], [`mineral`, `Mineral`], [`rock`, `Rock`]]"
            option-label="1"
            option-value="0"
            :show-clear="true"
          />
        </div>
      </div>

      <div v-if="sortMenuVisible" id="menu-sort" v-on-window="hideSortMenu" class="bg-primary border-primary-60/40 absolute right-0 top-12 w-96 rounded-md border p-4">
        <div class="form-field">
          <ul class="space-y-1">
            <li v-for="[id, label, direction] in sortOptions" :key="id" class="group">
              <div class="bg-primary-80/40 flex w-full flex-row justify-between rounded-sm px-3 py-2">
                <a class="cursor-pointer hover:underline" @click.stop.prevent="sortTop(id)">{{ label }}</a>
                <div class="invisible inline-flex space-x-2 group-hover:visible">
                  <a v-if="direction !== 0" class="text-primary-40 cursor-pointer hover:underline" @click.stop.prevent="sortReverse(id)">{{ direction === 1 ? `ASC` : `DESC` }}</a>
                  <a class="cursor-pointer hover:underline" @click.stop.prevent="sortUp(id)">Up</a>
                  <a class="cursor-pointer hover:underline" @click.stop.prevent="sortTop(id)">Top</a>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="columnMenuVisible" id="menu-columns" v-on-window="hideColumnMenu" class="bg-primary border-primary-60/40 absolute right-0 top-12 w-96 rounded-md border p-4">
        <div class="form-field">
          <ul class="space-y-1">
            <li v-for="column in columnsOptions" :key="(column[0])" class="bg-primary-80/40 flex w-full flex-row rounded-sm px-3 py-1">
              <PvCheckbox
                :id="`column-${column[0]}`"
                v-model="column[2]"
                :label="column[1]"
                :name="`column-${column[0]}`"
                class="rounded-lg p-1"
              />
            </li>
          </ul>
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
const { options: sortedColumnIDs, sortBy } = useSort(columns.value.map(([id]) => id))
const sortOptions = computed(() => sortedColumnIDs.filter(([id]) => columns.value.find(([colID]) => colID === id)).map(([id, order]) => [id, columns.value.find(([colID]) => colID === id)?.[1], order]))
watch(sortedColumnIDs, () => {
  sort.value = sortedColumnIDs
    .filter(([id, order]) => order !== 0)
    .map(([id, order]) => `${order === -1 ? `-` : ``}${id}`)
})

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
