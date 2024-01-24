<template>
  <PvImageGallery :images="images" :multi="multi" :selection="defaultSelection" @select="onSelect" @unselect="onUnselect" />
</template>

<script setup lang="ts">
import { type JImage } from "@unb-libraries/nuxt-layer-entity"

const props = defineProps<{
  images: JImage[]
  multi: boolean
  modelValue: string | string[] | undefined
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  "update:modelValue": [value: string | string[] | undefined]
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

function onSelect(image: JImage, newSelection: JImage[]) {
  selection.value = props.multi
    ? newSelection.map(img => img.self)
    : newSelection.length > 0
      ? newSelection[0].self
      : undefined
}

function onUnselect(image: JImage, newSelection: JImage[]) {
  onSelect(image, newSelection)
}

</script>
