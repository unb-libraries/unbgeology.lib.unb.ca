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
      <button id="button-filter" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.stop.prevent="filterMenuVisible = !filterMenuVisible">
        Filter
      </button>
      <button id="button-sort" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="sortMenuVisible = !sortMenuVisible">
        Sort
      </button>
      <button id="button-columns" class="form-action form-action-submit bg-primary-80/40 hover:bg-primary-60/40 grow-0 p-2" @click.prevent="columnMenuVisible = !columnMenuVisible">
        Columns
      </button>

      <PvContextualDropdown v-model="filterMenuVisible" trigger-id="button-filter" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-6" @click.prevent.stop="filterMenuVisible = !filterMenuVisible">
        <div class="form-field">
          <label class="form-label" for="filter-category">Categories</label>
          <PvMultipleChoice v-model="categoryFilter" :options="categoryOptions" class="rounded-lg p-1" />
        </div>
        <div class="form-field">
          <label for="fiter-test">Test</label>
          <PvInputText v-model="test" class="dark:bg-primary border-primary-80 rounded-lg border p-1.5">
            <template #before>
              <PvIconSort class="h-4 w-4" />
            </template>
          </PvInputText>
        </div>
        <div class="space-x-2">
          <button type="submit" class="form-action form-action-submit" @click.prevent="applyFilter()">
            Apply
          </button>
          <a class="cursor-pointer p-2 hover:underline" @click.prevent="filter = []">Reset</a>
        </div>
      </PvContextualDropdown>

      <PvContextualDropdown v-model="sortMenuVisible" trigger-id="button-sort" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-4" @click.stop.prevent="sortMenuVisible = !sortMenuVisible">
        <div class="form-field space-y-4">
          <div v-if="activeSortOptions.length > 0" class="space-y-2">
            <h2 class="text-lg font-bold">
              Sort by
            </h2>
            <ul v-if="activeSortOptions.length > 0" class="space-y-1">
              <li v-for="([id, label, direction], index) in activeSortOptions" :key="id" class="group">
                <div class="bg-primary-80/40 flex w-full flex-row justify-between rounded-sm px-3 py-2">
                  <div class="space-x-2">
                    <a @click.stop.prevent="">{{ label }}</a>
                    <a class="text-primary-40 cursor-pointer text-xs hover:underline" @click.stop.prevent="sortReverse(id)">{{ direction === 1 ? `ASC` : `DESC` }}</a>
                  </div>
                  <div class="invisible inline-flex space-x-2 group-hover:visible">
                    <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="sortUp(id)">Up</a>
                    <a v-if="index > 0" class="cursor-pointer hover:underline" @click.stop.prevent="sortTop(id)">Top</a>
                    <a class="cursor-pointer hover:underline" @click.stop.prevent="unsort(id)">Remove</a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-if="inactiveSortOptions.length > 0" class="space-y-2">
            <h2 class="text-lg font-bold">
              Unsorted
            </h2>
            <ul class="space-y-1">
              <li v-for="[id, label] in inactiveSortOptions" :key="id" class="group">
                <div class="bg-primary-80/40 flex w-full flex-row justify-between rounded-sm px-3 py-2">
                  <a class="cursor-pointer hover:underline" @click.stop.prevent="sortTop(id)">{{ label }}</a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </PvContextualDropdown>

      <PvContextualDropdown v-model="columnMenuVisible" trigger-id="button-columns" class="bg-primary border-primary-60/40 right-0 top-12 w-96 rounded-md border p-4">
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
      </PvContextualDropdown>
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
      <NuxtLink :to="`/dashboard/specimens/${specimen.id.toLowerCase()}`" class="hover:underline" @click.stop="">
        {{ specimen.id.toUpperCase() }}
      </NuxtLink>
    </template>
    <template #type="{ entity: specimen }">
      {{ specimen.type.substring(0, 1).toUpperCase() + specimen.type.substring(1).toLowerCase() }}
    </template>
    <template #classification="{ entity: specimen }">
      <template v-if="specimen.classification">
        {{ specimen.classification.label }}
      </template>
    </template>
    <template #images="{ entity: specimen }">
      <nuxt-img
        v-if="specimen.images?.total > 0"
        :src="specimen.images?.entities[0].uri"
        format="webp"
        fit="cover"
        width="100"
        height="100"
      />
      <div v-else class="bg-primary-80 border-primary-60 grid h-[100px] w-[100px] grid-cols-1 place-items-center border">
        <PvIconNoImage />
      </div>
    </template>
    <template #measurements="{ entity: specimen }">
      <ol v-if="specimen.measurements?.filter(m => m.type !== MeasurementType.IMMEASURABLE).length > 0">
        <li v-for="(dimensions, index) in specimen.measurements.map<NonNullable<Specimen[`measurements`][number][`dimensions`]>>(m => m.dimensions!)" :key="index">
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
import { FilterOperator, type EntityJSON } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen, MeasurementType } from 'types/specimen'

definePageMeta({
  layout: `dashboard`,
  name: `Specimens`,
  menu: {
    weight: 10,
  },
})

const columns = ref<(string | [string, string])[]>([
  [`images`, `Image`],
  [`id`, `ID`],
  [`type`, `Category`],
  [`classification`, `Classification`],
  [`pieces`, `Pieces`],
  [`measurements`, `Dimensions`],
])

const { list, entities: specimens, query } = await fetchEntityList<Specimen>(`Specimen`, {
  select: columns.value.map(([id]) => id),
})

const { filter, search, page, pageSize, sort } = query

const filterMenuVisible = ref(false)

const columnMenuVisible = ref(false)
const columnsOptions = ref<[string, string, boolean][]>(columns.value.map(([id, label], index) => [id, label, index < 4]))

const sortMenuVisible = ref(false)
const { options: sortedColumnIDs, sortTop, sortUp, sortReverse, remove: unsort } = useSort(columns.value.map(([id]) => id))

const sortOptions = computed(() => sortedColumnIDs.filter(([id]) => columns.value.find(([colID]) => colID === id)).map<[string, string, 1 | 0 | -1]>(([id, order]) => [id, columns.value.find(([colID]) => colID === id)![1], order]))
const activeSortOptions = computed(() => sortOptions.value.filter(([_, __, direction]) => direction !== 0))
const inactiveSortOptions = computed(() => sortOptions.value.filter(([_, __, direction]) => direction === 0))

watch(sortedColumnIDs, () => {
  sort.value = sortedColumnIDs
    .filter(([id, order]) => order !== 0)
    .map(([id, order]) => `${order === -1 ? `-` : ``}${id}`)
})

const selected = ref<EntityJSON<Specimen>[]>([])

const test = ref(``)

const { create: createFilter, apply: applyFilter } = useFilters(filter)

const categoryOptions = [`fossil`, `mineral`, `rock`]
const categoryFilter = createFilter<string[]>(`category`, FilterOperator.EQUALS, {
  input: values => values,
  output: values => values,
  empty: value => value.length === 0 || value.length === categoryOptions.length,
})
</script>
