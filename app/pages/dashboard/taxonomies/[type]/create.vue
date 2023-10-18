<template>
  <TaxonomyTermForm
    :type="(type as string)"
    :success-url="`/dashboard/taxonomies/${type}`"
    :cancel-url="`/dashboard/taxonomies/${type}`"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})

const { type } = useRoute().params
</script>
