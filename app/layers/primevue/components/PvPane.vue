<template>
  <div :class="[collapsible ? collapsed ? collapsedClass : expandedClass : '', { 'cursor-pointer': collapsible && collapsed }]" @click="toggleIfCollapsed">
    <div class="empty:hidden" :class="[headerClass ?? '', { 'cursor-pointer': collapsible }]" @click.stop="toggle">
      <slot name="header" />
    </div>
    <slot v-if="!collapsible || !collapsed" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  headerClass?: string
  expandedClass?: string
  collapsedClass?: string
  collapsible?: boolean
}>()

const collapsed = ref(false)

function toggle() {
  if (props.collapsible) {
    collapsed.value = !collapsed.value
  }
}

function toggleIfCollapsed() {
  if (props.collapsible && collapsed.value) {
    collapsed.value = false
  }
}
</script>
