<template>
  <div class="group relative size-full" :data-placeholder="!Boolean(specimen.images?.entities?.length) ? '' : undefined">
    <SpecimenImage
      :category="specimen.type"
      :url="specimen.images?.entities?.[currentIndex]?.uri"
      width="320"
      height="320"
      class="aspect-square text-base-57"
    >
      <template #placeholder>
        <SpecimenIcon :category="specimen.type" class="absolute top-[calc((100%-4.125rem-1px)/6)] size-[calc((100%-4.125rem-1px)/3*2)] fill-none stroke-current stroke-1" />
      </template>
    </SpecimenImage>
    <button v-if="(specimen.images?.entities ?? []).length > 1"
      class="absolute left-4 xl:left-2 top-[calc((100%-4.125rem-1px)/2-1.5rem)] xl:top-[calc((100%-4.125rem-1px)/2-1rem)]  hidden group-hover:flex bg-base-17 dark:bg-base-2 xl:dark:bg-accent-6 hover:bg-accent-26 dark:hover:bg-accent-36 rounded-sm shadow-lg shadow-base-17/60 dark:shadow-base-87/30"
      @click="currentIndex = (currentIndex - 1 + specimen.images.entities.length) % specimen.images.entities.length">
      <IconAngleDown class="size-12 xl:size-8 stroke-base-97 stroke-2 rotate-90 fill-none" />
    </button>
    <button v-if="(specimen.images?.entities ?? []).length > 1"
      class="absolute right-4 xl:right-2 top-[calc((100%-4.125rem-1px)/2-1.5rem)] xl:top-[calc((100%-4.125rem-1px)/2-1rem)] hidden group-hover:flex bg-base-17 dark:bg-base-2 xl:dark:bg-accent-6 hover:bg-accent-26 dark:hover:bg-accent-36 rounded-sm shadow-lg shadow-base-17/60 dark:shadow-base-87/30"
      @click="currentIndex = (currentIndex + 1) % specimen.images.entities.length">
      <IconAngleDown class="size-12 xl:size-8 stroke-base-97 stroke-2 -rotate-90 fill-none" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { Specimen } from '~/types/specimen'

defineProps<{
  specimen: Specimen
}>()

const currentIndex = ref(0)
</script>