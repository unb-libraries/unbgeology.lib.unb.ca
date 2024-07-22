<template>
  <div v-if="pages.length > 1">
    <a v-if="!pages.includes(1)" class="hover:dark:bg-primary-60/20 cursor-pointer rounded-md px-3 py-1.5" @click.stop.prevent="$emit(`change`, 1)">First</a>
    <a
      v-for="index in pages"
      :key="index"
      class="mx-2 rounded-md px-3 py-1.5"
      :class="{ 'hover:dark:bg-primary-60/20 cursor-pointer': index !== page, 'dark:bg-primary-80/75': index === page }"
      @click.stop.prevent="$emit(`change`, index)"
    >{{ index }}</a>
    <a v-if="!pages.includes(total)" class="hover:dark:bg-primary-60/20 cursor-pointer rounded-md px-3 py-1.5" @click.stop.prevent="$emit(`change`, total)">Last</a>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number
  size: number
  total: number
}>()

defineEmits<{
  change: [page: number]
}>()

const pages = computed(() => {
  const count = Math.min(props.size, props.total)
  return Array
    .from({ length: count }, (_, i) => props.page - Math.floor(count / 2) + i)
    .map((page, _, arr) => page + arr.filter(p => p <= 0).length)
    .map((page, _, arr) => page - arr.filter(p => p > props.total).length)
})
</script>
