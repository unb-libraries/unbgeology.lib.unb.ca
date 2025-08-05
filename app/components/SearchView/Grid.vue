<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <li v-for="specimen in specimens" :key="specimen.self" class="flex relative bg-base-77 overflow-hidden justify-center items-center aspect-square">
      <SpecimenImageCarousel :specimen />
      <div class="absolute bottom-0 w-full p-4 bg-base-77/90 sm:px-3 sm:py-2 md:px-3 md:py-1.5 lg:p-4 xl:p-2 flex flex-col">
        <div class="flex items-center gap-x-1">
          <a :href="`/specimens/${specimen.id}`" :title="specimen.name ?? 'Unknown'" class="leading-tight text-5xl sm:text-3xl md:text-2xl lg:text-xl xl:text-lg truncate hover:underline">{{ specimen.name ?? 'Unknown' }}</a>
          <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" title="Unpublished" class="fill-none stroke-red stroke-2 size-4" />
        </div>
        <div class="inline-flex items-center gap-x-1 leading-tight text-base-27 text-2xl sm:text-lg md:text-md lg:text-sm xl:text-xs">
          <SpecimenIcon :category="specimen.type" class="size-4" />
          <span class="sr-only">Classification</span>
          <span class="font-semibold uppercase">{{ specimen.type[0].toUpperCase() + specimen.type.slice(1) }} / {{ specimen.classification?.label ?? 'Unknown' }}</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { type Specimen, Status } from '~/types/specimen'

defineProps<{
  specimens: Specimen[]
}>()
</script>