<template>
  <NuxtLayout :name="(`search-${mode}` as 'search-list' | 'search-grid' | 'search-map')" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  name: 'Search',
})

useCustomHead({ image: '/top-cat-images-fossils.jpg' })

const mode = useRouteQuery<'list' | 'grid' | 'map'>('mode', 'list')
</script>