<template>
  <StorageLocationForm
    type="storagelocation"
    success-url="/dashboard/taxonomies/storagelocation"
    cancel-url="/dashboard/taxonomies/storagelocation"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})
</script>
