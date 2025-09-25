<template>
  <NuxtLayout :name="(`search-${mode}` as 'search-list' | 'search-grid' | 'search-map')" />
</template>

<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'

definePageMeta({
  layout: false,
  name: 'Search',
})

const mode = useRouteQuery<'list' | 'grid' | 'map'>('mode', 'list')
</script>