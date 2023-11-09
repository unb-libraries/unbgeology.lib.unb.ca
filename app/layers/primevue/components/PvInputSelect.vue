<template>
  <PvSelect v-if="!multi" />
  <PvMultiSelect v-else />
</template>

<script setup lang="ts">
defineProps<{
  multi?: boolean
}>()
</script>
