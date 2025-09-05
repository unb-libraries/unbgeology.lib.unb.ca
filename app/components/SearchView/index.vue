<template>
  <SearchViewList v-if="mode === 'list'" />
  <SearchViewGrid v-else-if="mode === 'grid'" />
  <SearchViewMap v-else-if="mode === 'map'" />
</template>

<script lang="ts" setup>
defineProps<{
  mode: 'list' | 'grid' | 'map'
}>()
</script>