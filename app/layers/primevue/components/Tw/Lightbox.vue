<template>
  <div :style="{ height: height ? `${height}px` : `100%`, width: width ? `${width}px` : `100%`}" class="group relative">
    <div class="from-primary absolute hidden h-1/5 w-full bg-gradient-to-b to-transparent group-hover:block">
      <div class="bg-primary-60 hover:bg-primary-40 absolute right-4 top-4 rounded-md p-1 hover:cursor-pointer">
        <IconCancel
          class=" h-9 w-9 stroke-current stroke-1"
          @click.prevent.stop="$emit(`cancel`)"
        />
      </div>
      <button class="button button-lg absolute left-4 top-4" :class="{ 'button-accent-mid hover:button-accent-light': !selected, 'button-red hover:button-red-light': selected }" @click.stop.prevent="selected ? $emit(`unselect`, src) : $emit(`select`, src)">
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
