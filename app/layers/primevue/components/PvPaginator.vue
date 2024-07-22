<template>
  <div v-if="pages.length > 1">
    <a v-if="!pages.includes(1)" class="hover:dark:bg-primary-60/20 cursor-pointer rounded-md px-3 py-1.5" @click.stop.prevent="page = 1">First</a>
    <a
      v-for="index in pages"
      :key="index"
      class="mx-2 rounded-md px-3 py-1.5"
      :class="{ 'hover:dark:bg-primary-60/20 cursor-pointer': index !== page, 'dark:bg-primary-80/75': index === page }"
      @click.stop.prevent="page = index"
    >{{ index }}</a>
    <a v-if="!pages.includes(total)" class="hover:dark:bg-primary-60/20 cursor-pointer rounded-md px-3 py-1.5" @click.stop.prevent="page = total">Last</a>
  </div>
</template>

<script setup lang="ts">
// REFACTOR: Make this a prop
const page = defineModel({ required: false, default: 1 })
const props = defineProps<{
  size: number
  total: number
}>()

defineEmits<{
  paged: [page: number]
}>()

const pages = computed(() => {
  const count = Math.min(props.size, props.total)
  return Array
    .from({ length: count }, (_, i) => page.value - Math.floor(count / 2) + i)
    .map((page, _, arr) => page + arr.filter(p => p <= 0).length)
    .map((page, _, arr) => page - arr.filter(p => p > props.total).length)
})
</script>
