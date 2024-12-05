<template>
  <TwDocumentBrowser
    v-model="selection"
  />
</template>

<script setup lang="tsx">
import type { Document, EntityJSON } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard-page`,
  name: `Documents`,
})

const selection = ref<EntityJSON<Document>>()
</script>
