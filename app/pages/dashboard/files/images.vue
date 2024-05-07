<template>
  <div v-if="selectedImage" class="mb-2 h-96">
    <nuxt-img
      :src="selectedImage.uri"
      :alt="selectedImage.alt"
      :title="selectedImage.title"
      class="h-full object-contain"
    />
  </div>
  <PvImageGallery :selection="selectedImage" :images="images" @select="onSelect" @unselect="onUnselect" />
  <PvFileUpload :types="[`image/jpeg`]" @accepted="onAccepted" />
</template>

<script setup lang="ts">
import { FileState, FilterOperator, type EntityJSON, type EntityJSONList, type File as IFile, type Image as IImage } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
  name: `Images`,
})

const selectedImage = ref<EntityJSON<IImage>>()

function onSelect(image: EntityJSON<IImage>) {
  selectedImage.value = image
}

function onUnselect() {
  selectedImage.value = undefined
}

async function onAccepted(formData: FormData, upload: (formData: FormData) => Promise<EntityJSONList<IFile> | null>) {
  formData.append(`persisted`, `${true}`)
  formData.append(`type`, `image`)
  await upload(formData)
  refresh()
}

const { entities: images, refresh } = await fetchEntityList<IImage>(`File`, {
  filter: [
    [`type`, FilterOperator.EQUALS, `image`],
    [`status`, FilterOperator.EQUALS, FileState.PERSISTED],
  ],
})
</script>
