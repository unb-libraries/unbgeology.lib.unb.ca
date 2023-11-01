<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
    <div v-for="image in images" :key="image.self" class="bg-primary-20 dark:bg-primary-80 aspect-square hover:cursor-pointer hover:grayscale">
      <img :src="`/image/${image.filename}`" :alt="image.alt" :title="image.title" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type EntityJSON, type Image } from 'layers/base/types/entity';

defineProps<{
  images: EntityJSON<Image>[]
}>()
</script>