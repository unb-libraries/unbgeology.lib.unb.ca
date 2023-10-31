<template>
  <div class="grid grid-cols-12 gap-2">
    <div v-for="(image, index) in list?.entities" :key="image.self" class="bg-primary-80 aspect-square hover:cursor-pointer hover:grayscale">
      <img :src="`/image/${image.filename}`" alt="Test">
    </div>
  </div>
  <div class="bg-primary-80 mt-2 p-8 text-center" @drop.prevent="onDrop" @dragover.prevent="">
    Drop files here.
  </div>
</template>

<script setup lang="ts">
import { type File } from '~/server/entityTypes/File'

definePageMeta({
  layout: `dashboard`,
})

const onDrop = async function ({ dataTransfer }: DragEvent) {
  console.log(`Files dropped...`)
  if (dataTransfer?.items) {
    for (const item of dataTransfer.items) {
      const file = item.getAsFile()
      if (file) {
        formData.append(`files`, file)
      }
    }
  } else if (dataTransfer?.files) {
    for (const file of dataTransfer.files) {
      formData.append(`files`, file)
    }
  }

  await useFetch(`/api/upload`, {
    method: `POST`,
    body: formData,
  })
  formData.delete(`files`)
  refresh()
}

const { list, refresh } = await fetchEntityList<File>(`/api/files`)
const formData = new FormData()
formData.append(`persisted`, `true`)

</script>
