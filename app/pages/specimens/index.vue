<template>
  <div class="flex-col flex h-full">
    <div class="sticky top-[10rem] pb-2 space-y-2 z-30 bg-base dark:bg-primary-80">
      <div class="flex justify-between items-center space-x-2">
        <a v-if="list?.total" class="flex-none py-1">Displaying {{ (page - 1) * pageSize + 1 }} - {{ (page - 1) * pageSize + specimens.length }} of {{ list?.total }} specimens</a>
      </div>
      <div class="flex-none space-x-1 w-full flex">
        <div class="form-field grow">
          <label class="sr-only" for="search">Search</label>
          <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 rounded-md input leading-[1.5rem] grow p-2 placeholder:italic">
        </div>
        <button class="bg-base justify-center items-center flex xl:hidden hover:border-accent-light border rounded-md border-primary-60 aspect-square dark:bg-primary flex-none cursor-pointer" @click.prevent.stop="sidebarCollapsed = !sidebarCollapsed">
          <IconFilter class="fill-none stroke-current size-6 stroke-1.5 flex" />
        </button>
        <button v-show="mode === 'map'" class="bg-base justify-center hover:border-accent-light items-center flex border rounded-md border-primary-60 aspect-square dark:bg-primary flex-none cursor-pointer" @click.prevent.stop="onSwitchViewMode('list')">
          <IconList class="fill-none stroke-current size-6 stroke-1.5 flex" />
        </button>
        <button v-show="mode === 'list'" class="bg-base justify-center items-center flex hover:border-accent-light border rounded-md border-primary-60 aspect-square dark:bg-primary flex-none cursor-pointer" @click.prevent.stop="onSwitchViewMode('map')">
          <IconMap class="fill-none stroke-current size-6 stroke-1.5 flex" />
        </button>
      </div>
    </div>
    <div class="flex flex-col xl:flex-row grow gap-x-2">
      <div v-show="Object.keys(list?.facets ?? {}).length" :class="['xl:w-1/5 xl:relative', { 'fixed top-0 left-0 size-full bg-primary-80/80': !sidebarCollapsed }]" @click.stop.self="sidebarCollapsed = true">
        <div :class="['absolute gap-2 xl:flex xl:flex-col bottom-0 xl:sticky xl:top-[calc(15.5rem+2px)] max-h-4/5 xl:max-h-[calc(100vh-15.5rem-2px)] overflow-y-scroll left-0 w-full', { hidden: sidebarCollapsed }]">
          <Facet v-if="facets.category" v-model="categories" :options="facets.category" value-field="id" label-field="label" title="Categories" class="flex-none" />
          <Facet v-if="facets.classification" v-model="classifications" :options="facets.classification" value-field="self" label-field="label" title="Classification" class="shrink" />
          <Facet v-if="facets.age" v-model="units" :options="facets.age" value-field="self" label-field="label" title="Age" class="shrink" />
          <Facet v-if="facets.onDisplay" v-model="onDisplay" :options="facets.onDisplay.map(({ value, count }) => ({ value: { value, label: value === true ? 'Yes' : 'No' }, count }))" value-field="value" label-field="label" title="On display" class="flex-none" />
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
          <div v-else-if="mode === 'list'" class="flex justify-center items-center h-[calc(100vh-15.5rem-2px)] bg-primary-60">
            <span class="text-2xl">No specimens found</span>
          </div>
          <LeafletMap v-else :center="mapCenter" :zoom="7" :max-zoom="18" class="z-0 h-[calc(100vh-15.5rem-2px)]" @drag="onDragMap" @zoom="onZoomMap">
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
        </KeepAlive>
      </div>
    </div>
    <TwPageIndex v-if="mode === 'list'" :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="10" @change="(index) => { page = index }" class="flex justify-end flex-none w-full" />
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
const mode = ref<'list' | 'map'>(['list', 'map'].find(mode => mode === (Array.isArray(q.mode) ? q.mode.at(-1) : q.mode)) as 'list' | 'map' ?? 'list')
const mapCenter = ref<Coordinate>([46.65848709787655, -66.35685870803573]) // Initially center on NB

const { entities: specimens, list, query: { page, pageSize, search, select, filter } } = await fetchEntityList<Specimen>("Specimen", {
  search: (Array.isArray(q.search) ? q.search.at(-1) : q.search) ?? '',
  select: ['id', 'name', 'images', 'type', 'classification', 'origin', 'status'],
  page: (Array.isArray(q.page) ? Number(q.page.at(-1)) : q.page) ?? 1,
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
const onDisplay = ref<boolean[]>(filter.value?.filter(([field]) => field === 'storage.location.public').map(([, , value]) => true) ?? [])

function updateFilter() {
  filter.value = [
    ...filter.value.filter(([field]) => !['type', 'classification', 'age.relative', 'storage.location.public'].includes(field)),
    ...categories.value.map(category => ['type', FilterOperator.EQUALS, category] as Filter),
    ...classifications.value.map(classification => ['classification', FilterOperator.EQUALS, classification] as Filter),
    ...units.value.map(unit => ['age.relative', FilterOperator.EQUALS, unit] as Filter),
    ...onDisplay.value.map(() => ['storage.location.public', FilterOperator.EQUALS] as Filter),
  ]
}

watch(categories, updateFilter)
watch(classifications, updateFilter)
watch(units, updateFilter)
watch(onDisplay, updateFilter)

function onSwitchViewMode(newMode: 'list' | 'map') {
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