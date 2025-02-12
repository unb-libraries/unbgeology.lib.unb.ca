<template>
  <div class="space-y-4">
    <span v-if="list?.total">Displaying {{ specimens.length }} of {{ list?.total }} specimens</span>
    <div class="form-field w-full">
      <label class="sr-only" for="search">Search</label>
      <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 rounded-md form-input form-input-text grow p-2 placeholder:italic">
    </div>
    <div class="flex gap-2">
      <div class="w-1/5 space-y-2">
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
      </div>
      <div class="w-4/5">
        <ul class="space-y-2">
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
                  <dd class="text-xl">{{ specimen.name }}</dd>
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
      </div>
    </div>
    <TwPageIndex :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="10" @change="(index) => { page = index }" class="flex justify-end" />
  </div>
</template>

<script setup lang="ts">
import { FilterOperator, type Filter } from '@unb-libraries/nuxt-layer-entity'
import type { Specimen } from '~/types/specimen'

definePageMeta({
  layout: 'page',
  name: 'Search',
})

const { entities: specimens, list, query: { page, pageSize, search, filter } } = await fetchEntityList<Specimen>("Specimen")

// Filter
const categoriesCollapsed = ref(false)
const categories = computed({
  get: () => (filter.value
    ?.filter(([field, op]) => field === 'type' && op === FilterOperator.EQUALS) ?? [])
    .map(([, , value]) => Array.isArray(value) ? value : [value]).flat(),
  set: (category: string[]) => filter.value = [
    ...filter.value.filter(([field]) => field !== 'type'),
    ...category.map(category => ['type', FilterOperator.EQUALS, category] as Filter)
  ]
})

function onUpdateClassification(selection: [string, string][]) {
  filter.value = [
    ...filter.value.filter(([field]) => field !== 'classification'),
    ...selection.map(([id]) => ['classification', FilterOperator.EQUALS, id] as Filter)
  ]
}
</script>