<template>
  <div :style="{ height: height ? `${height}px` : `100%`, width: width ? `${width}px` : `100%`}" class="group relative">
    <div class="from-primary absolute hidden h-1/5 w-full bg-gradient-to-b to-transparent group-hover:block">
      <IconCancel
        class="fill-primary-40 hover:fill-primary-60 absolute right-4 top-4 h-12 w-12 stroke-current stroke-1 hover:cursor-pointer"
        @click.prevent.stop="$emit(`cancel`)"
      />
      <button class="button button-lg button-accent-mid hover:button-accent-light absolute left-4 top-4" @click.stop.prevent="selected ? $emit(`unselect`, src) : $emit(`select`, src)">
        {{ selected ? `Unselect` : `Select` }}
      </button>
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
