<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
    <div v-for="image in images" :key="image.self" class="bg-primary-20 dark:bg-primary-80 aspect-square hover:cursor-pointer hover:grayscale">
      <nuxt-img
        :src="`/image/${image.filename}`"
        :alt="image.alt"
        :title="image.title"
        :class="{ 'border-accent-mid border-4': selection.includes(image)}"
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
import { type EntityJSON, type Image } from 'layers/base/types/entity'

const props = defineProps<{
  images: EntityJSON<Image>[]
  multi?: boolean
}>()

const emits = defineEmits<{
  selected: [img: EntityJSON<Image>]
  unselected: [img: EntityJSON<Image>]
}>()

function onClick(img: EntityJSON<Image>) {
  const multi = props.multi ?? false
  if (!selection.value.includes(img)) {
    if (multi) {
      selection.value.push(img)
    } else {
      selection.value = [img]
    }
    emits(`selected`, img)
  } else {
    if (multi) {
      const index = selection.value.findIndex(i => i === img)
      selection.value.splice(index, 1)
    } else {
      selection.value = []
    }
    emits(`unselected`, img)
  }
}

const selection = ref([] as EntityJSON<Image>[])
</script>
