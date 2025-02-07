<template>
  <div class="bg-primary-60 py-2 px-4 space-y-2 divide-y divide-primary-40">
    <div class="inline-flex items-center justify-between w-full">
      <button @click.prevent="collapsed = !collapsed" class="inline-flex items-center justify-between w-full cursor-pointer">
        <slot name="title" :title="title">
          <span class="block text-xl">{{ title }}</span>
        </slot>
        <IconAngleDown v-if="collapsed" class="size-8 fill-none stroke-white" />
        <IconAngleUp v-else class="size-8 fill-none stroke-white" />
      </button>
    </div>
    <div v-show="!collapsed" class="flex flex-col py-2">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const collapsed = defineModel<boolean>('collapsed', { default: true })

defineProps<{
  title: string
}>()
</script>