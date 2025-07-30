<template>
  <IconFossil v-if="category === 'fossil'" class="fill-none stroke-current stroke-1.5" />
  <IconMineral v-else-if="category === 'mineral'" class="fill-none stroke-current stroke-1.5" />
  <IconRock v-else class="fill-none stroke-current stroke-1.5" />
</template>

<script lang="ts" setup>

defineProps<{
  category: string
}>()
</script>