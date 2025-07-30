<template>
  <div :class="['w-full items-center space-x-2', { 'inline-flex': collapsed }]">
    <span
      ref="text" :class="{ 'truncate': collapsed }" :data-truncated="truncates || undefined">
      <slot />
    </span>
    <button v-if="truncates" class="flex-none text-xs text-base-27 inline text-nowrap underline" @click="collapsed = !collapsed">
      {{ collapsed ? 'More' : 'Less' }}
    </button>
  </div>
</template>

<script lang="ts" setup>
const text = ref<HTMLElement>()
const truncates = computed(() => {
  return text.value && text.value?.scrollWidth - text.value?.getBoundingClientRect().width > 1
})
const collapsed = ref(true)
</script>