<template>
  <PvImageGallery :images="images" :multi="Array.isArray(modelValue)" :selection="defaultSelection" @select="onSelect" @unselect="onUnselect" />
</template>

<script setup lang="ts">
import { type JImage } from 'layers/base/types/entity'

const props = defineProps<{
  images: JImage[]
  modelValue: string | string[]
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  "update:modelValue": [value: string | string[]]
}>()

const defaultSelection = computed(() => {
  const images = props.images
    .filter(img => Array.isArray(props.modelValue)
      ? props.modelValue.includes(img.self)
      : props.modelValue === img.self)
  return Array.isArray(props.modelValue) ? images : images[0]
})

const selection = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits(`update:modelValue`, value)
  },
})

function onSelect(image: JImage, newSelection: JImage | JImage[]) {
  selection.value = Array.isArray(newSelection)
    ? newSelection.map(img => img.self)
    : newSelection.self
}

function onUnselect(image: JImage, newSelection: JImage | JImage[]) {
  selection.value = Array.isArray(newSelection)
    ? newSelection.map(img => img.self)
    : newSelection.self
}

</script>
