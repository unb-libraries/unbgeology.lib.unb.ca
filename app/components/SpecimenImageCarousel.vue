<template>
  <div class="group relative" :data-placeholder="!Boolean(specimen.images?.entities?.length) ? '' : undefined">
    <SpecimenImage
      :category="specimen.type"
      :url="specimen.images?.entities?.[currentIndex]?.uri"
      width="320"
      height="320"
      class="aspect-square text-base-57"
    >
      <template #placeholder>
        <SpecimenIcon :category="specimen.type" class="size-1/2 fill-none stroke-current stroke-1" />
      </template>
    </SpecimenImage>
    <div v-if="(specimen.images?.entities ?? []).length > 1"
      class="absolute left-0 top-0 hidden group-hover:flex bg-gradient-to-r from-black/70 to-transparent w-16 h-full items-center justify-start"
    >
      <button @click="currentIndex = (currentIndex - 1 + specimen.images.entities.length) % specimen.images.entities.length">
        <IconAngleDown class="size-12 stroke-base-77 stroke-2 hover:stroke-base-57 rotate-90 fill-none" />
      </button>
    </div>
    <div v-if="(specimen.images?.entities ?? []).length > 1"
      class="absolute right-0 top-0 hidden group-hover:flex bg-gradient-to-l from-black/70 to-transparent w-16 h-full items-center justify-end"
    >
      <button @click="currentIndex = (currentIndex + 1) % specimen.images.entities.length">
        <IconAngleDown class="size-12 stroke-base-77 stroke-2 hover:stroke-base-57 -rotate-90 fill-none" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Specimen } from '~/types/specimen'

defineProps<{
  specimen: Specimen
}>()

const currentIndex = ref(0)
</script>