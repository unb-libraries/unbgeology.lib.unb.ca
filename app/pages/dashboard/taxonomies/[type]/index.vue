<template>
  <PvEntityTable :uri="`/api/taxonomies/${type}`" :columns="[`label`]" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})

const { type } = useRoute().params
</script>
