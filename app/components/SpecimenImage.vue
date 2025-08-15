<template>
  <div class="flex justify-center items-center bg-base-77 dark:bg-base-7 text-base-57 dark:text-base-37 border border-transparent dark:border-base-12" :data-placeholder="!Boolean(url) ? '' : undefined">
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