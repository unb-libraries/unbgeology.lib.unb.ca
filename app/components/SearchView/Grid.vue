<template>
  <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <li v-for="specimen in specimens" :key="specimen.self" class="group flex relative bg-base-77 hover:bg-base-97 overflow-hidden justify-center items-center aspect-square border border-transparent hover:border-accent-22">
      <SpecimenImageCarousel :specimen />
      <div class="absolute bottom-0 left-0 flex flex-col w-full p-3 bg-base-77/85 group-hover:bg-base-97 gap-y-1">
        <h2 class="flex items-center gap-x-1">
          <a :href="`/specimens/${specimen.id}`" :title="specimen.name ?? 'Unknown'" class="leading-none text-lg hover:text-accent-22 truncate overflow-hidden border-b border-current">{{ specimen.name ?? 'Unknown' }}</a>
          <IconLock v-if="useEnum(Status).valueOf(specimen.status) !== Status.PUBLISHED" title="Unpublished" class="text-red stroke-2 size-4" />
        </h2>
        <div class="inline-flex items-center gap-x-1 text-base-27 text-2xl sm:text-lg md:text-md lg:text-sm">
          <SpecimenIcon :category="specimen.type" class="size-4" />
          <span class="sr-only">Classification</span>
          <span class="font-semibold uppercase truncate overflow-hidden">{{ specimen.type[0].toUpperCase() + specimen.type.slice(1) }} / {{ specimen.classification?.label ?? 'Unknown' }}</span>
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