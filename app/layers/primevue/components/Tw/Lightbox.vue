<template>
  <div :style="{ height: height ? `${height}px` : `100%`, width: width ? `${width}px` : `100%`}">
    <img :src="src" @click.stop.prevent="unstackContent">
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  src: string
  height?: number
  width?: number
}>()

const { unstackContent } = useModal()
</script>
