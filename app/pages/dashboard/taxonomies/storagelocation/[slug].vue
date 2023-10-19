<template>
  <StorageLocationForm
    type="storagelocation"
    :slug="(slug as string)"
    success-url="/dashboard/taxonomies/storagelocation"
    cancel-url="/dashboard/taxonomies/storagelocation"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})

const { slug } = useRoute().params
</script>
