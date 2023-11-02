<template>
  <PvImageGallery :images="images" :multi="Array.isArray(modelValue)" @select="onSelect" @unselect="onUnselect" />
</template>

<script setup lang="ts">
import { type JImage } from 'layers/base/types/entity'

const props = defineProps<{
  images: JImage[]
  modelValue: JImage | JImage[]
}>()

const emits = defineEmits<{
  "update:modelValue": [value: JImage | JImage[]]
}>()

const selection = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits(`update:modelValue`, value)
  },
})

function onSelect(image: JImage, newSelection: JImage[]) {
  if (Array.isArray(props.modelValue)) {
    selection.value = newSelection
  } else {
    selection.value = newSelection[0]
  }
}

function onUnselect(image: JImage, newSelection: JImage[]) {
  if (Array.isArray(props.modelValue)) {
    selection.value = newSelection
  } else {
    selection.value = {} as JImage
  }
}

</script>
