<template>
  <PvImageGallery :images="list?.entities ?? []" />
  <PvFileUpload @uploaded="refresh()" />
</template>

<script setup lang="ts">
import { type Image } from "layers/base/types/entity"

definePageMeta({
  layout: `dashboard`,
})

const { list, refresh } = await fetchEntityList<Image>(`/api/files`)
</script>
