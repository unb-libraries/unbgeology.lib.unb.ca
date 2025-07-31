<template>
  <div class="justify-center items-center flex" :data-placeholder="!Boolean(url) ? '' : undefined">
    <img v-if="url" :src="`${url}?w=${width}&h=${height}`" />
    <IconFossil v-else-if="category === 'fossil'" class="size-2/3 fill-none stroke-current stroke-1.5" />
    <IconMineral v-else-if="category === 'mineral'" class="size-2/3 fill-none stroke-current stroke-1.5" />
    <IconRock v-else class="size-2/3 fill-none stroke-current stroke-1.5" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  category: 'fossil' | 'mineral' | 'rock'
  url?: string
  width?: string
  height?: string
}>()
</script>