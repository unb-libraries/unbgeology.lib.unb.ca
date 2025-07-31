<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
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
</template>

<script lang="ts" setup>
import { type Specimen, Status } from '~/types/specimen'

defineProps<{
  specimens: Specimen[]
}>()
</script>