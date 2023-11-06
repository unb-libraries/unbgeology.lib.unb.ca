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

<script setup lang="ts" generic="M extends boolean = false">
import { type JImage } from 'layers/base/types/entity'

const props = defineProps<{
  images: JImage[]
  multi?: M
  selection?: M extends false ? JImage : JImage[]
}>()

const emits = defineEmits<{
  select: [image: JImage, selection: M extends false ? JImage : JImage[]]
  unselect: [image: JImage, selection: M extends false ? JImage : JImage[]]
}>()

const selection = ref<JImage[]>(Array.isArray(props.selection)
  ? props.selection
  : props.selection !== undefined
    ? [props.selection]
    : [])

function isSelected(image: JImage) {
  return selection.value.find(({ self }) => image.self === self) ?? false
}

function onClick(image: JImage) {
  if (!isSelected(image)) {
    if (props.multi) {
      selection.value.push(image)
    } else {
      selection.value = [image]
    }
    emits(`select`, image, selection.value as M extends false ? JImage : JImage[])
  } else {
    if (props.multi) {
      const index = selection.value.findIndex(({ self }) => image.self === self)
      selection.value.splice(index, 1)
    } else {
      selection.value = []
    }
    emits(`unselect`, image, selection.value as M extends false ? JImage : JImage[])
  }
}
</script>
