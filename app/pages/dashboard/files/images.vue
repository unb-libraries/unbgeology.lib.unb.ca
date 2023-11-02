<template>
  <div v-if="selectedImage" class="mb-2 h-96">
    <nuxt-img
      :src="`/image/${selectedImage.filename}`"
      :alt="selectedImage.alt"
      :title="selectedImage.title"
      class="h-full object-contain"
    />
  </div>
  <PvImageGallery :images="list?.entities ?? []" @select="onSelect" @unselect="onUnselect" />
  <PvFileUpload @uploaded="refresh()" />
</template>

<script setup lang="ts">
import { EntityJSON, type Image } from "layers/base/types/entity"

definePageMeta({
  layout: `dashboard`,
})

const selectedImage = ref<EntityJSON<Image>>()

function onSelect(image: EntityJSON<Image>) {
  selectedImage.value = image
}

function onUnselect() {
  selectedImage.value = undefined
}

const { list, refresh } = await fetchEntityList<Image>(`/api/files`)
</script>
