<template>
  <div v-if="pages.length > 1" class="flex items-center gap-x-1">
    <a v-if="!pages.includes(1)" class="rounded-md px-2 py-1 cursor-pointer border border-transparent hover:border-accent-26 dark:hover:border-accent-36 text-sm font-semibold uppercase hover:text-accent-26 dark:hover:text-accent-36" @click.stop.prevent="$emit(`change`, 1)"
    >
      First
    </a>
    <a
      v-for="index in pages"
      :key="index"
      :data-active="index === page ? '' : undefined"
      class="rounded-md px-2 py-1 border border-transparent hover:border-accent-26 dark:hover:border-accent-36 dark:data-[active]:hover:border-transparent text-sm font-semibold uppercase hover:text-accent-26 dark:hover:text-accent-36 cursor-pointer data-[active]:cursor-text data-[active]:bg-base-17 dark:data-[active]:bg-base-77 data-[active]:border-transparent data-[active]:text-base-97 dark:data-[active]:text-base-7"
      @click.stop.prevent="$emit(`change`, index)"
    >
      {{ index }}
    </a>
    <a v-if="!pages.includes(total)" class="rounded-md px-2 py-1 cursor-pointer border border-transparent hover:border-accent-26 dark:hover:border-accent-36 text-sm font-semibold uppercase hover:text-accent-26 dark:hover:text-accent-36" @click.stop.prevent="$emit(`change`, total)"
    >
      Last
    </a>
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
