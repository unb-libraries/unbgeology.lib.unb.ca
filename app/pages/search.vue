<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <div class="w-1/5 bg-primary-60 p-4">
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
    <div class="flex justify-between">
      <span v-if="list?.total">Displaying {{ specimens.length }} of {{ list?.total }} specimens</span>
      <TwPageIndex :page="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="10" @change="(index) => { page = index }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Specimen } from '~/types/specimen'

definePageMeta({
  layout: 'page',
  name: 'Search',
})

const { entities: specimens, list, query: { page, pageSize } } = await fetchEntityList<Specimen>("Specimen")

</script>