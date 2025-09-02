<template>
  <div class="flex-col flex h-full">
    <div class="sticky top-[10rem] pb-2 space-y-2 z-30 bg-base dark:bg-base-2">
      <div class="flex justify-between items-center space-x-2">
        <a v-if="list?.total" class="flex-none py-1">Displaying {{ (page - 1) * pageSize + 1 }} - {{ (page - 1) * pageSize + specimens.length }} of {{ list?.total }} specimens</a>
        <TwPageIndex v-if="mode !== 'map'" :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" @change="(index) => { page = index }" class="flex justify-end flex-none" />
      </div>
      <div class="flex-none space-x-1 w-full flex">
        <div class="form-field grow">
          <label class="sr-only" for="search">Search</label>
          <InputSearch v-model="search" :timeout="600" class="shadow-none" />
        </div>
        <button
          :data-active="!sidebarCollapsed ? '' : undefined"
          class="inline-flex xl:hidden space-x-1 p-2 justify-center hover:border-accent-26 hover:text-accent-26 data-[active]:bg-base-17 data-[active]:border-base-17 uppercase font-semibold data-[active]:hover:bg-accent-26 data-[active]:hover:border-accent-26 data-[active]:text-base-97 items-center border border-base-17 rounded-md flex-none cursor-pointer"
          @click.prevent.stop="sidebarCollapsed = !sidebarCollapsed"
        >
          <IconFilter class="fill-none stroke-current size-6 stroke-1.5" />
          <span>Filter</span>
        </button>
        <button v-for="m in ['list', 'grid', 'map']" :key="m"
          :data-active="mode === m ? '' : undefined"
          class="inline-flex space-x-1 p-2 justify-center hover:border-accent-26 dark:hover:border-accent-36 hover:text-accent-26 dark:hover:text-accent-36 data-[active]:bg-base-17 dark:data-[active]:bg-base-77 data-[active]:border-base-17 dark:data-[active]:border-base-77 uppercase font-semibold data-[active]:text-base-97 dark:data-[active]:text-base-7 data-[active]:cursor-default items-center border border-base-17 dark:border-base-77 rounded-md flex-none cursor-pointer"
          @click.prevent.stop="onSwitchViewMode(m)"
        >
          <component :is="{ list: IconList, grid: IconGrid, map: IconMap }[m as 'list' | 'grid' | 'map']" class="fill-none stroke-current size-6 stroke-1.5" />
          <span>{{ m.charAt(0).toUpperCase() + m.slice(1) }}</span>
        </button>
      </div>
    </div>
    <div class="flex flex-col xl:flex-row grow gap-x-6">
      <template v-if="list?.total">
        <div v-show="Object.keys(list?.facets ?? {}).length" :class="['group xl:w-1/5 xl:relative z-40 xl:z-auto', { 'fixed top-0 left-0 size-full bg-primary-80/80': !sidebarCollapsed }]" @click.stop.self="sidebarCollapsed = true">
          <div :class="['absolute scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent group-hover:scrollbar-thumb-base-57 dark:group-hover:scrollbar-thumb-base-27 gap-2 xl:flex xl:flex-col bottom-0 xl:sticky xl:top-[calc(15.5rem+2px)] max-h-4/5 xl:max-h-[calc(100dvh-15.5rem-2px)] overflow-y-scroll left-0 w-full', { hidden: sidebarCollapsed }]">
            <Facet v-if="(facets.category ?? []).length" v-model="categories" :options="facets.category" value-field="id" label-field="label" title="Categories" class="flex-none" />
            <Facet v-if="(facets.classification ?? []).length" v-model="classifications" :options="facets.classification" value-field="self" label-field="label" title="Classification" :collapsible="10" class="shrink" />
            <Facet v-if="(facets.age ?? []).length" v-model="units" :options="facets.age" value-field="self" label-field="label" title="Age" :collapsible="10" class="shrink" />
            <Facet v-if="(facets.numericAge ?? []).length" v-model="numericAge" :options="facets.numericAge.map(({ value, count }) => ({ value: value[0], label: value.map((b: number) => Math.floor(b / 1000000)), count })).map(({ value, label, count }) => ({ value: { value, label: label[0] === 0 ? `< ${label[1]} Mya` : label.length < 2 ? `> ${label[0]} Mya` : `${label[0]} - ${label[1]} Mya` }, count }))" value-field="value" label-field="label" title="Numeric Age" class="flex-none" />
            <Facet v-if="(facets.onDisplay ?? []).length" v-model="onDisplay" :options="facets.onDisplay.map(({ value, count }) => ({ value: { value, label: value === true ? 'Yes' : 'No' }, count }))" value-field="value" label-field="label" title="On display" class="flex-none" />
          </div>
        </div>
        <div class="w-full xl:w-4/5 h-full relative">
          <KeepAlive>
            <SearchViewList v-if="mode === 'list' && list?.total" :specimens="specimens" />
            <SearchViewGrid v-else-if="mode === 'grid' && list?.total" :specimens="specimens" />
            <SearchViewMap v-else-if="mode === 'map' && list?.total" :specimens :pending />
          </KeepAlive>
        </div>
      </template>
      <div v-else class="p-4">
        No specimens found
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconList, IconGrid, IconMap } from '#components'
import { FilterOperator, type Filter } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from '~/types/specimen'

definePageMeta({
  layout: 'page',
  name: 'Search',
})

const { query: q } = useRoute()
const mode = ref<'list' | 'grid' | 'map'>(['list', 'grid', 'map'].find(mode => mode === (Array.isArray(q.mode) ? q.mode.at(-1) : q.mode)) as 'list' | 'grid' | 'map' ?? 'list')

const { entities: specimens, list, pending, query: { page, pageSize, search, filter } } = await fetchEntityList<Specimen>("Specimen", {
  search: (Array.isArray(q.search) ? q.search.at(-1) : q.search) ?? '',
  select: ['id', 'name', 'description', 'images', 'type', 'classification', 'age', 'origin', 'status'],
  page: Math.max(Array.isArray(q.page) ? Number(q.page.at(-1)) : Number(q.page ?? 1), 1),
  pageSize: Math.max(Array.isArray(q.pageSize) ? Number(q.pageSize.at(-1)) : Number(q.pageSize ?? 20), 1),
  filter: (Array.isArray(q.filter) ? q.filter : [q.filter].filter(Boolean)).map(filter => filter?.split(':')),
})

const facets = computed(() => list.value?.facets as Record<string, { value: unknown, count: number }[]> ?? {})
const sidebarCollapsed = ref(true)

const updateQuery = () => useRouter().replace({
  query: {
    mode: mode.value,
    search: search.value,
    page: page.value,
    pageSize: pageSize.value,
    filter: filter.value.filter(Boolean).map(f => f.join(':'))
  }
})

watch(page, (newPage, prevPage) => {
  if (newPage > Math.ceil((list.value?.total ?? 0) / pageSize.value)) {
    page.value = Math.max(Math.ceil((list.value?.total ?? 0) / pageSize.value), 1)
  } else if (prevPage !== undefined) {
    updateQuery()
  }
}, { immediate: true })
watch(mode, updateQuery)
watch(search, updateQuery)
watch(filter, updateQuery)

const categories = ref<string[]>(filter.value?.filter(([field]) => field === 'type').map(([, , value]) => value as string) ?? [])
const classifications = ref<string[]>(filter.value?.filter(([field]) => field === 'classification').map(([, , value]) => value as string) ?? [])
const units = ref<string[]>(filter.value?.filter(([field]) => field === 'age.relative').map(([, , value]) => value as string) ?? [])
const numericAge = ref<number[]>([(filter.value?.filter(([field, op]) => field === 'age.numeric' && [FilterOperator.GREATER, FilterOperator.LESS, FilterOperator.EQUALS].includes(op)).map(([, , value]) => Number(value)) ?? [])].filter(value => value.length === 2) ?? [])
const onDisplay = ref<boolean[]>(filter.value?.filter(([field]) => field === 'storage.location.public').map(([, , value]) => true) ?? [])

function updateFilter() {
  filter.value = [
    ...filter.value.filter(([field]) => !['type', 'classification', 'age.relative', 'age.numeric', 'storage.location.public'].includes(field)),
    ...categories.value.map(category => ['type', FilterOperator.EQUALS, category] as Filter),
    ...classifications.value.map(classification => ['classification', FilterOperator.EQUALS, classification] as Filter),
    ...units.value.map(unit => ['age.relative', FilterOperator.EQUALS, unit] as Filter),
    ...numericAge.value
      .map((b) => ((facets.value.numericAge
        .map(({ value }) => value as [number, number])
        .find(([l]) => l === b)) ?? [])
        .map((b, i) => ['age.numeric', ((!i && FilterOperator.GREATER) || (FilterOperator.LESS | FilterOperator.EQUALS)), String(b)] as Filter))
      .flat(),
    ...onDisplay.value.map(() => ['storage.location.public', FilterOperator.EQUALS, '1'] as Filter),
  ]
}

watch(categories, updateFilter)
watch(classifications, updateFilter)
watch(units, updateFilter)
watch(numericAge, updateFilter)
watch(onDisplay, updateFilter)

function onSwitchViewMode(newMode: 'list' | 'grid' | 'map') {
  const currentMode = mode.value
  mode.value = newMode
  if (newMode === 'map') {
    filter.value = [...filter.value, ['origin', FilterOperator.GREATER, '90.1;180.1'], ['origin', FilterOperator.LESS, '-90.1;-180.1']]
  } else if (currentMode === 'map') {
    filter.value = filter.value.filter(([field]) => field !== 'origin')
  }
}
</script>