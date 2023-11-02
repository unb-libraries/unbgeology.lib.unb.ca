<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
    <div
      v-for="image in images"
      :key="image.self"
      class="hover:bg-accent-mid aspect-square hover:cursor-pointer"
      :class="{ 'dark:bg-accent-mid bg-accent-mid': isSelected(image), 'bg-primary-20 dark:bg-primary-80': !isSelected(image) }"
    >
      <nuxt-img
        :src="`/image/${image.filename}`"
        :alt="image.alt"
        :title="image.title"
        class="hover:opacity-30"
        :class="{ 'opacity-30': isSelected(image) }"
        format="webp"
        fit="cover"
        sizes="sm:180px md:90px lg:60px xl:100px"
        width="600"
        height="600"
        @click.stop="onClick(image)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type JImage } from 'layers/base/types/entity'

defineProps<{
  images: JImage[]
  multi?: boolean
}>()

const emits = defineEmits<{
  select: [image: JImage, selection: JImage[]]
  unselect: [image: JImage, selection: JImage[]]
}>()

const selection = ref([] as JImage[])

function isSelected(image: JImage) {
  return selection.value.includes(image)
}

function onClick(image: JImage) {
  if (!isSelected(image)) {
    selection.value.push(image)
    emits(`select`, image, selection.value)
  } else {
    const index = selection.value.findIndex(i => i === image)
    selection.value.splice(index, 1)
    emits(`unselect`, image, selection.value)
  }
}
</script>
