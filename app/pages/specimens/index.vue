<template>
  <div class="flex-col flex h-full">
    <div class="sticky top-[10rem] pb-2 space-y-2 z-30 bg-base dark:bg-primary-80">
      <div class="flex justify-between items-center space-x-2">
        <a v-if="list?.total" class="flex-none py-1">Displaying {{ (page - 1) * pageSize + 1 }} - {{ (page - 1) * pageSize + specimens.length }} of {{ list?.total }} specimens</a>
        <TwPageIndex v-if="mode !== 'map'" :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" @change="(index) => { page = index }" class="flex justify-end flex-none" />
      </div>
      <div class="flex-none space-x-1 w-full flex">
        <div class="form-field grow">
          <label class="sr-only" for="search">Search</label>
          <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 rounded-md input leading-[1.5rem] grow p-2 placeholder:italic">
        </div>
        <button
          :data-active="sidebarCollapsed"
          class="inline-flex space-x-1 p-2 justify-center items-center xl:hidden hover:bg-base-77 data-[active]:hover:bg-base-57 data-[active] border rounded-md border-base-57 flex-none cursor-pointer"
          @click.prevent.stop="sidebarCollapsed = !sidebarCollapsed"
        >
          <IconFilter class="fill-none stroke-current size-6 stroke-1.5" />
          <span>Filter</span>
        </button>
        <button v-for="m in ['list', 'grid', 'map']" :key="m"
          :data-active="mode === m ? '' : undefined"
          class="inline-flex space-x-1 p-2 justify-center hover:bg-base-77 data-[active]:bg-base-57 data-[active]:text-base-97 data-[active]:cursor-default items-center border rounded-md border-base-57 flex-none cursor-pointer"
          @click.prevent.stop="onSwitchViewMode(m)"
        >
          <component :is="{ list: IconList, grid: IconGrid, map: IconMap }[m as 'list' | 'grid' | 'map']" class="fill-none stroke-current size-6 stroke-1.5" />
          <span>{{ m.charAt(0).toUpperCase() + m.slice(1) }}</span>
        </button>
      </div>
    </div>
    <div class="flex flex-col xl:flex-row grow gap-x-2">
      <div v-show="Object.keys(list?.facets ?? {}).length" :class="['xl:w-1/5 xl:relative z-40 xl:z-auto', { 'fixed top-0 left-0 size-full bg-primary-80/80': !sidebarCollapsed }]" @click.stop.self="sidebarCollapsed = true">
        <div :class="['absolute gap-2 xl:flex xl:flex-col bottom-0 xl:sticky xl:top-[calc(15.5rem+2px)] max-h-4/5 xl:max-h-[calc(100dvh-15.5rem-2px)] overflow-y-scroll left-0 w-full', { hidden: sidebarCollapsed }]">
          <Facet v-if="(facets.category ?? []).length" v-model="categories" :options="facets.category" value-field="id" label-field="label" title="Categories" class="flex-none" />
          <Facet v-if="(facets.classification ?? []).length" v-model="classifications" :options="facets.classification" value-field="self" label-field="label" title="Classification" :collapsible="10" class="shrink" />
          <Facet v-if="(facets.age ?? []).length" v-model="units" :options="facets.age" value-field="self" label-field="label" title="Age" :collapsible="10" class="shrink" />
          <Facet v-if="(facets.onDisplay ?? []).length" v-model="onDisplay" :options="facets.onDisplay.map(({ value, count }) => ({ value: { value, label: value === true ? 'Yes' : 'No' }, count }))" value-field="value" label-field="label" title="On display" class="flex-none" />
          <Facet v-if="(facets.numericAge ?? []).length" v-model="numericAge" :options="facets.numericAge.map(({ value, count }) => ({ value: value[0], label: value.map((b: number) => Math.floor(b / 1000000)), count })).map(({ value, label, count }) => ({ value: { value, label: label[0] === 0 ? `< ${label[1]} Mya` : label.length < 2 ? `> ${label[0]} Mya` : `${label[0]} - ${label[1]} Mya` }, count }))" value-field="value" label-field="label" title="Numeric Age" class="flex-none" />
        </div>
      </div>
      <div class="w-full xl:w-4/5 h-full relative">
        <KeepAlive>
          <SearchViewList v-if="mode === 'list' && list?.total" :specimens="specimens" />
          <SearchViewGrid v-else-if="mode === 'grid' && list?.total" :specimens="specimens" />
          <SearchViewMap v-else-if="mode === 'map' && list?.total" :specimens :pending />
          <div v-else="!list?.total" class="flex justify-center items-center h-[calc(100dvh-15.5rem-2px)] bg-primary-60">
            <span class="text-2xl">No specimens found</span>
          </div>
        </KeepAlive>
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


const { entities: specimens, list, pending, query: { page, pageSize, search, select, filter } } = await fetchEntityList<Specimen>("Specimen", {
  search: (Array.isArray(q.search) ? q.search.at(-1) : q.search) ?? '',
  select: ['id', 'name', 'description', 'images', 'type', 'classification', 'age', 'origin', 'status'],
  page: (Array.isArray(q.page) ? Number(q.page.at(-1)) : Number(q.page ?? 1)),
  pageSize: q.mode === 'map' ? 500 : 20,
  filter: (Array.isArray(q.filter) ? q.filter : [q.filter].filter(Boolean)).map(filter => filter?.split(':')),
})

const facets = computed(() => list.value?.facets as Record<string, { value: unknown, count: number }[]> ?? {})
const sidebarCollapsed = ref(true)

const updateQuery = () => useRouter().replace({
  query: {
    mode: mode.value,
    search: search.value,
    page: page.value,
    filter: filter.value.filter(Boolean).map(f => f.join(':'))
  }
})

watch(page, updateQuery)
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
    ...onDisplay.value.map(() => ['storage.location.public', FilterOperator.EQUALS] as Filter),
  ]
}

watch(categories, updateFilter)
watch(classifications, updateFilter)
watch(units, updateFilter)
watch(numericAge, updateFilter)
watch(onDisplay, updateFilter)

function onSwitchViewMode(newMode: 'list' | 'grid' | 'map') {
  mode.value = newMode
  if (newMode === 'map') {
    filter.value = [...filter.value, ['origin', FilterOperator.GREATER, '90.1;180.1'], ['origin', FilterOperator.LESS, '-90.1;-180.1']]
  } else {
    filter.value = filter.value.filter(([field]) => field !== 'origin')
  }
}
</script>