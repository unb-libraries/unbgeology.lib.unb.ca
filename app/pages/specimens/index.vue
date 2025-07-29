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
        <button :class="['inline-flex space-x-1 p-2 justify-center items-center xl:hidden hover:border-accent-light border rounded-md border-primary-60 flex-none cursor-pointer', { 'dark:bg-accent-dark bg-accent-light': !sidebarCollapsed }]" @click.prevent.stop="sidebarCollapsed = !sidebarCollapsed">
          <IconFilter class="fill-none stroke-current size-6 stroke-1.5" />
          <span>Filter</span>
        </button>
        <button :class="['inline-flex space-x-1 p-2 justify-center hover:border-accent-light items-center border rounded-md border-primary-60 flex-none cursor-pointer', { 'dark:bg-accent-dark bg-accent-light': mode === 'list', 'bg-base dark:bg-primary': mode !== 'list' }]" @click.prevent.stop="onSwitchViewMode('list')">
          <IconList class="fill-none stroke-current size-6 stroke-1.5" />
          <span>List</span>
        </button>
        <button :class="['inline-flex space-x-1 p-2 justify-center hover:border-accent-light items-center border rounded-md border-primary-60 flex-none cursor-pointer', { 'dark:bg-accent-dark bg-accent-light': mode === 'grid', 'bg-base dark:bg-primary': mode !== 'grid' }]" @click.prevent.stop="onSwitchViewMode('grid')">
          <IconGrid class="fill-none stroke-current size-6 stroke-1.5" />
          <span>Grid</span>
        </button>
        <button :class="['inline-flex space-x-1 p-2 justify-center items-center hover:border-accent-light border rounded-md border-primary-60 flex-none cursor-pointer', { 'dark:bg-accent-dark bg-accent-light': mode === 'map', 'bg-base dark:bg-primary': mode !== 'map' }]" @click.prevent.stop="onSwitchViewMode('map')">
          <IconMap class="fill-none stroke-current size-6 stroke-1.5" />
          <span>Map</span>
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
      <div class="grow h-full relative">
        <KeepAlive>
          <ul v-if="mode === 'list' && list?.total" class="space-y-2 overflow-y-scroll h-full">
            <li v-for="specimen in specimens" :key="specimen.self" class="bg-primary-20 dark:bg-primary-60">
              <div class="flex flex-row">
                <div class="h-20 aspect-square bg-primary-40 dark:bg-primary-20 flex justify-center items-center">
                  <img v-if="specimen.images?.total > 0" :src="`${specimen.images?.entities[0].uri}?w=100&h=100`" class="aspect-square object-cover">
                  <IconFossil v-else-if="specimen.type === 'fossil'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                  <IconRock v-else-if="specimen.type === 'rock'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                  <IconMineral v-else-if="specimen.type === 'mineral'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                </div>
                <dl class="flex flex-row gap-x-12 p-4 w-full">
                  <div class="w-1/2">
                    <dt class="sr-only">ID</dt>
                    <dd class="text-sm space-x-2">
                      <span>{{ specimen.id.toUpperCase() }}</span>
                      <span v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" :class="['text-xs rounded-md px-2 py-1', {
                        'bg-yellow text-primary': useEnum(Status).valueOf(specimen.status) === Status.MIGRATED,
                        'bg-red-light': useEnum(Status).valueOf(specimen.status) === Status.DRAFT,
                        'bg-blue': useEnum(Status).valueOf(specimen.status) === Status.REVIEW,
                      }]">{{ useEnum(Status).labelOf(specimen.status).toUpperCase() }}</span></dd>
                    <dt class="sr-only">Name</dt>
                    <dd class="text-xl"><a :href="`/specimens/${specimen.id}`" class="hover:underline">{{ specimen.name ?? 'Unknown' }}</a></dd>
                  </div>
                  <div class="w-1/6">
                    <dt class="text-sm">Category</dt>
                    <dd class="text-xl">{{ specimen.type[0].toUpperCase() + specimen.type.slice(1).toLowerCase() }}</dd>
                  </div>
                  <div class="w-1/3">
                    <dt class="text-sm">Classification</dt>
                    <dd class="text-xl">{{ specimen.classification?.label }}</dd>
                  </div>
                </dl>
              </div>
            </li>
          </ul>
          <ul v-else-if="mode === 'grid' && list?.total" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            <li v-for="specimen in specimens" :key="specimen.self" class="bg-primary-20 dark:bg-primary-60">
              <a :href="`/specimens/${specimen.id}`" class="relative aspect-square bg-primary-40 dark:bg-primary-20 flex justify-center items-center">
                <span v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" :class="['absolute top-2 left-2 text-xs rounded-md px-2 py-1', {
                  'bg-yellow text-primary': useEnum(Status).valueOf(specimen.status) === Status.MIGRATED,
                  'bg-red-light': useEnum(Status).valueOf(specimen.status) === Status.DRAFT,
                  'bg-blue': useEnum(Status).valueOf(specimen.status) === Status.REVIEW,
                }]"
                >
                  {{ useEnum(Status).labelOf(specimen.status).toUpperCase() }}
                </span>
                <img v-if="specimen.images?.total > 0" :src="`${specimen.images?.entities[0].uri}?w=200&h=200`" class="aspect-square object-cover">
                <IconFossil v-else-if="specimen.type === 'fossil'" class="absolute size-1/2 left-1/4 top-[8.33%] stroke-base dark:stroke-primary-40 fill-none" />
                <IconRock v-else-if="specimen.type === 'rock'" class="absolute size-1/2 left-1/4 top-[8.33%] stroke-base dark:stroke-primary-40 fill-none" />
                <IconMineral v-else-if="specimen.type === 'mineral'" class="absolute size-1/2 left-1/4 top-[8.33%] stroke-base dark:stroke-primary-40 fill-none" />
                <div class="absolute h-1/3 w-full bottom-0 bg-primary-20 dark:bg-primary-60/80 p-4 sm:px-3 sm:py-2 md:px-3 md:py-1.5 lg:p-4 xl:p-2 flex flex-col">
                  <a :href="`/specimens/${specimen.id}`" class="leading-[1.25em] text-5xl sm:text-3xl md:text-2xl lg:text-xl xl:text-lg truncate hover:underline">{{ specimen.name ?? 'Unknown' }}</a>
                  <span class="leading-[1.25em] text-2xl sm:text-lg md:text-md lg:text-sm xl:text-xs">{{ specimen.classification?.label }}</span>
                </div>
              </a>
            </li>
          </ul>
          <div v-else-if="mode === 'list'" class="flex justify-center items-center h-[calc(100dvh-15.5rem-2px)] bg-primary-60">
            <span class="text-2xl">No specimens found</span>
          </div>
          <div v-else class="relative z-0 h-[calc(100dvh-15.5rem-2px)]">
            <LeafletMap :center="mapCenter" :zoom="7" :max-zoom="18" class="h-full" @drag="onDragMap" @zoom="onZoomMap">
              <LeafletMarkerCluster>
                <LeafletMarker v-for="{ id, self, type, name, classification, images, origin: { name: originName, latitude, longitude } } in markers" :key="self"
                  :center="[latitude, longitude]"
                  :name="name"
                  :accuracy="0"
                  :draggable="false"
                  >
                  <div class="inline-flex gap-2">
                    <div class="h-20 aspect-square bg-primary-40 dark:bg-primary-20 flex justify-center items-center">
                      <img v-if="images?.total > 0" :src="`${images?.entities[0].uri}?w=100&h=100`" class="aspect-square object-cover">
                      <IconFossil v-else-if="type === 'fossil'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                      <IconRock v-else-if="type === 'rock'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                      <IconMineral v-else-if="type === 'mineral'" class="size-16 stroke-base dark:stroke-primary-40 fill-none" />
                    </div>
                    <div class="flex flex-col">
                      <a :href="`/specimens/${id}`" class="hover:underline text-lg">{{ name ?? 'Unknown' }}</a>
                      <span>{{ type[0].toUpperCase() + type.slice(1).toLowerCase() }}</span>
                      <span>{{ classification.label }}</span>
                      <span>{{ originName }}</span>
  
                    </div>
  
                  </div>
                </LeafletMarker>
              </LeafletMarkerCluster>
            </LeafletMap>
            <div v-if="pending" class="absolute z-[1000] bg-base dark:bg-primary-60 text-sm px-3 py-1.5 shadow-md shadow-primary/50 rounded-md bottom-6 left-1/2 flex items-center justify-center space-x-1">
              <IconSpinner class="size-4 fill-none stroke-2 stroke-current animate-spin" />
              <span>Refreshing...</span>
            </div>
          </div>
        </KeepAlive>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FilterOperator, type Filter } from '@unb-libraries/nuxt-layer-entity'
import { Status, type Specimen } from '~/types/specimen'
import type { Coordinate } from '~/types/leaflet'

definePageMeta({
  layout: 'page',
  name: 'Search',
})

const { query: q } = useRoute()
const mode = ref<'list' | 'grid' | 'map'>(['list', 'grid', 'map'].find(mode => mode === (Array.isArray(q.mode) ? q.mode.at(-1) : q.mode)) as 'list' | 'grid' | 'map' ?? 'list')
const mapCenter = ref<Coordinate>([46.65848709787655, -66.35685870803573]) // Initially center on NB

const { entities: specimens, list, pending, query: { page, pageSize, search, select, filter } } = await fetchEntityList<Specimen>("Specimen", {
  search: (Array.isArray(q.search) ? q.search.at(-1) : q.search) ?? '',
  select: ['id', 'name', 'images', 'type', 'classification', 'origin', 'status'],
  page: (Array.isArray(q.page) ? Number(q.page.at(-1)) : Number(q.page ?? 1)),
  pageSize: q.mode === 'map' ? 500 : 25,
  filter: (Array.isArray(q.filter) ? q.filter : [q.filter].filter(Boolean)).map(filter => filter?.split(':')),
})

const facets = computed(() => list.value?.facets as Record<string, { value: unknown, count: number }[]> ?? {})
const markers = computed(() => specimens.value.filter(({ origin }) => origin?.latitude && origin?.longitude))
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

function onUpdateCenter(center: Coordinate) {
  mapCenter.value = center
}

function onDragMap(center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
}

function onZoomMap(level: number, center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
}
</script>