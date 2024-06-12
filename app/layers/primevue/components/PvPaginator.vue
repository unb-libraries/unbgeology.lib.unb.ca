<template>
  <div v-if="pages.length > 1">
    <a v-if="!pages.includes(1)" class="hover:dark:bg-primary-60/20 cursor-pointer rounded-md px-3 py-1.5" @click="page = 1">First</a>
    <a
      v-for="index in pages"
      :key="index"
      class="mx-2 rounded-md px-3 py-1.5"
      :class="{ 'hover:dark:bg-primary-60/20 cursor-pointer': index !== page, 'dark:bg-primary-80/75': index === page }"
      @click="page = index"
    >{{ index }}</a>
    <a v-if="!pages.includes(total)" class="hover:dark:bg-primary-60/20 cursor-pointer rounded-md px-3 py-1.5" @click="page = total">Last</a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  size: number
  total: number
}>()

const emits = defineEmits<{
  // eslint-disable-next-line
  "update:modelValue": [value: number]
}>()

const page = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits(`update:modelValue`, value)
  },
})

function getStartPageIndex(current: number, count: number, last: number) {
  current = Math.min(Math.max(current, 1), last)
  const slice = Array
    .from({ length: count }, (_, i) => current - Math.floor(count / 2) + i)
    .filter(page => page >= 1 && page <= last)
  const imbalance = slice.filter(i => i > current).length - slice.filter(i => i < current).length
  const start = current - Math.floor(count / 2) + imbalance
  return start
}

const pages = computed(() => {
  const actualSize = Math.min(props.size, props.total)
  const start = getStartPageIndex(page.value, actualSize, props.total)
  return Array.from({ length: actualSize }).map((_, i) => start + i)
})
</script>
