<template>
  <div class="space-y-2 flex-col flex h-full">
    <span v-if="list?.total" class="flex-none">Displaying {{ specimens.length }} of {{ list?.total }} specimens</span>
    <div class="flex-none w-full flex">
      <div class="form-field grow">
        <label class="sr-only" for="search">Search</label>
        <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 rounded-md form-input form-input-text grow p-2 placeholder:italic">
      </div>
      <button class="justify-center hover:border-accent-mid items-center flex border rounded-md border-primary-60 aspect-square bg-primary flex-none cursor-pointer" @click.prevent.stop="viewMode = 'list'">
        <IconList class="fill-none stroke-current size-6 stroke-1.5 flex" />
      </button>
      <button class="justify-center items-center flex hover:border-accent-mid border rounded-md border-primary-60 aspect-square bg-primary flex-none cursor-pointer" @click.prevent.stop="viewMode = 'map'">
        <IconMap class="fill-none stroke-current size-6 stroke-1.5 flex" />
      </button>
    </div>
    <div class="flex grow gap-2 overflow-y-hidden">
      <div class="w-1/5 space-y-2 h-full overflow-y-scroll">
        <Filter title="Category" v-model:collapsed="categoriesCollapsed">
          <div class="inline-flex items-center space-x-1">
            <input type="checkbox" id="filter-category[fossil]" name="category[fossil]" class="size-5 rounded-md input input-checkbox" value="fossil" :checked="categories.includes('fossil')" @change="categories = categories.includes('fossil') ? categories.filter(cat => cat !== 'fossil') : [...categories, 'fossil']">
            <label for="filter-category[fossil]" class="text-lg mr-4 cursor-pointer">
              Fossil
            </label>
          </div>
          <div class="inline-flex items-center space-x-1">
            <input type="checkbox" id="filter-category[mineral]" name="category[mineral]" class="size-5 rounded-md input input-checkbox" value="mineral" :checked="categories.includes('mineral')" @change="categories = categories.includes('mineral') ? categories.filter(cat => cat !== 'mineral') : [...categories, 'mineral']">
            <label for="filter-category[mineral]" class="text-lg mr-4 cursor-pointer">
              Mineral
            </label>
          </div>
          <div class="inline-flex items-center space-x-1">
            <input type="checkbox" id="filter-category[rock]" name="category[rock]" class="size-5 rounded-md input input-checkbox" value="rock" :checked="categories.includes('rock')" @change="categories = categories.includes('rock') ? categories.filter(cat => cat !== 'rock') : [...categories, 'rock']">
            <label for="filter-category[rock]" class="text-lg mr-4 cursor-pointer">
              Rock
            </label>
          </div>
        </Filter>
        <FilterClassification v-on:update:model-value="onUpdateClassification" />
        <Filter title="Age" v-model:collapsed="ageCollapsed">
          <input v-model="age" type="range" min="0" :max="maxAge" step="1000000" list="legend" />
          <datalist id="legend" class="flex justify-between w-full">
            <option value="0" label="Any"></option>
            <option :value="maxAge" :label="`${maxAge / 1000000} Mya`"></option>
          </datalist>
        </Filter>
      </div>
      <div class="w-4/5 h-full overflow-y-scroll">
        <KeepAlive>
          <ul v-if="viewMode === 'list' && list?.total" class="space-y-2">
            <li v-for="specimen in specimens" :key="specimen.self" class="bg-primary-60">
              <div class="flex flex-row">
                <div class="h-24 aspect-square bg-primary-20 flex justify-center items-center">
                  <img v-if="specimen.images?.total > 0" :src="`${specimen.images?.entities[0].uri}?w=40&h=40`" class="aspect-square object-cover">
                  <IconFossil v-else-if="specimen.type === 'fossil'" class="size-16 stroke-primary-40 fill-none" />
                  <IconRock v-else-if="specimen.type === 'rock'" class="size-16 stroke-primary-40 fill-none" />
                  <IconMineral v-else-if="specimen.type === 'mineral'" class="size-16 stroke-primary-40 fill-none" />
                </div>
                <dl class="flex flex-row gap-x-12 p-4 w-full">
                  <div class="w-1/2">
                    <dt class="sr-only">ID</dt>
                    <dd class="text-sm">{{ specimen.id.toUpperCase() }}</dd>
                    <dt class="sr-only">Name</dt>
                    <dd class="text-xl"><a :href="`/specimens/${specimen.id}`" class="hover:underline">{{ specimen.name }}</a></dd>
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
          <div v-else-if="viewMode === 'list'" class="flex justify-center items-center h-full bg-primary-60">
            <span class="text-2xl">No specimens found</span>
          </div>
          <LeafletMap v-else :center="mapCenter" class="h-full" @drag="onDragMap" @zoom="onZoomMap">
            <LeafletMarker v-for="{ self, name, origin: { latitude, longitude } } in markers" :key="self"
              :center="[latitude, longitude]"
              :name="name"
              :accuracy="0"
              :draggable="false"
              />
          </LeafletMap>
        </KeepAlive>
      </div>
    </div>
    <TwPageIndex v-if="viewMode === 'list'" :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="10" @change="(index) => { page = index }" class="flex justify-end flex-none w-full" />
  </div>
</template>

<script setup lang="ts">
import { FilterOperator, type EntityJSONList, type Filter } from '@unb-libraries/nuxt-layer-entity'
import type { Specimen } from '~/types/specimen'
import type { Coordinate } from '~/types/leaflet'
import type { Unit } from '~/types/geochronology'

definePageMeta({
  layout: 'page',
  name: 'Search',
})

const viewMode = ref<'list' | 'map'>('list')
const mapCenter = ref<Coordinate>([46.65848709787655, -66.35685870803573]) // Initially center on NB
const categoriesCollapsed = ref(false)
const ageCollapsed = ref(false)
const maxAge = await (async () => {
  const { data } = await useFetch<EntityJSONList<Unit>>('/api/terms/geochronology', { query: { sort: "-start", pageSize: 1 } })
  return data.value?.entities[0]?.start ?? 0
})()

const { entities: specimens, list, query: { page, pageSize, search, filter } } = await fetchEntityList<Specimen>("Specimen", { select: ['id', 'name', 'type', 'classification'] })
const markers = computed(() => specimens.value.filter(({ origin }) => origin?.latitude && origin?.longitude))

// Filter
const categories = computed({
  get: () => (filter.value
    ?.filter(([field, op]) => field === 'type' && op === FilterOperator.EQUALS) ?? [])
    .map(([, , value]) => Array.isArray(value) ? value : [value]).flat(),
  set: (category: string[]) => filter.value = [
    ...filter.value.filter(([field]) => field !== 'type'),
    ...category.map(category => ['type', FilterOperator.EQUALS, category] as Filter)
  ]
})

const age = computed({
  get: () => Math.max(0, ...(filter.value
    ?.filter(([field, op]) => field === 'age.numeric' && op === FilterOperator.GREATER) ?? [])
    .map(([, , value]) => Array.isArray(value) ? value : [value]).flat()),
  set: (age: number) => filter.value = [
    ...filter.value.filter(([field]) => field !== 'age.numeric'),
    (age > 0 ? ['age.numeric', FilterOperator.GREATER, `${age}`] : []) as Filter,
  ].filter(Boolean)
})

function onSwitchViewMode(mode: 'list' | 'map') {
  viewMode.value = mode
}

function onUpdateClassification(selection: [string, string][]) {
  filter.value = [
    ...filter.value.filter(([field]) => field !== 'classification'),
    ...selection.map(([id]) => ['classification', FilterOperator.EQUALS, id] as Filter)
  ]
}

function onUpdateBounds([northEast, southWest]: [Coordinate, Coordinate]) {
  filter.value = [
    ...filter.value.filter(([field]) => field !== 'origin'),
    ['origin', FilterOperator.GREATER, northEast.join(`;`)] as Filter,
    ['origin', FilterOperator.LESS, southWest.join(`;`)] as Filter
  ]
}

function onUpdateCenter(center: Coordinate) {
  mapCenter.value = center
}

function onDragMap(center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
  onUpdateBounds(bounds)
}

function onZoomMap(level: number, center: Coordinate, bounds: [Coordinate, Coordinate]) {
  onUpdateCenter(center)
  onUpdateBounds(bounds)
}
</script>