<template>
  <div class="justify-center items-center bg-base-77 text-base-57 flex" :data-placeholder="!Boolean(url) ? '' : undefined">
    <img v-if="url" :src="`${url}?w=${width}&h=${height}`" class="object-cover h-full" />
    <slot v-else name="placeholder">
      <SpecimenIcon :category="category" class="size-2/3 fill-none stroke-current stroke-1" />
    </slot>
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