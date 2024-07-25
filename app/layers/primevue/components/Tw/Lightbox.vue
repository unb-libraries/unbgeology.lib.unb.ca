<template>
  <div :style="{ height: height ? `${height}px` : `100%`, width: width ? `${width}px` : `100%`}" class="group relative">
    <div class="from-primary absolute hidden h-1/5 w-full bg-gradient-to-b to-transparent empty:hidden group-hover:block">
      <slot name="controls" />
    </div>
    <img :src="width && height ? `${src}?w=${width}&h=${height}` : src">
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  src: string
  selected?: boolean
  height?: number
  width?: number
}>()

defineEmits<{
  select: [uri: string]
  unselect: [uri: string]
  cancel: []
}>()
</script>
