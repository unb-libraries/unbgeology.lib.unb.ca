<template>
  <div :class="['rounded-md py-2 space-y-2 flex flex-col', { 'flex-none': collapsed }]">
    <button @click.prevent.stop="collapsed = !collapsed" class="inline-flex text-base-27 dark:text-base-67 hover:text-accent-26 dark:hover:text-accent-36 items-center justify-between w-full cursor-pointer pb-1 border-b border-base-57 dark:border-base-27">
      <slot name="title" :title="title">
        <span class="font-semibold uppercase">{{ title }}</span>
      </slot>
      <IconAngleDown v-if="collapsed" class="size-4 fill-none stroke-current stroke-2" :class="togglerClass" />
      <IconAngleUp v-else class="size-4 fill-none stroke-current stroke-2" :class="togglerClass" />
    </button>
    <div v-show="!collapsed" class="py-1">
      <div class="flex flex-col space-y-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const collapsed = defineModel<boolean>('collapsed', { default: true })

defineProps<{
  title: string
  togglerClass?: string
}>()
</script>