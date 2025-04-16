<template>
  <div class="bg-primary-20 dark:bg-primary-60 py-2 px-4 space-y-2 divide-y divide-primary-40 overflow-y-hidden flex flex-col">
    <div class="inline-flex items-center justify-between w-full flex-none">
      <button @click.prevent="collapsed = !collapsed" class="inline-flex items-center justify-between w-full cursor-pointer">
        <slot name="title" :title="title">
          <span class="block text-xl">{{ title }}</span>
        </slot>
        <IconAngleDown v-if="collapsed" class="size-8 fill-none stroke-white" :class="togglerClass" />
        <IconAngleUp v-else class="size-8 fill-none stroke-white" :class="togglerClass" />
      </button>
    </div>
    <div v-show="!collapsed" class="py-2 grow overflow-y-hidden">
      <div class="flex flex-col h-full overflow-y-scroll">
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