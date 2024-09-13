<template>
  <NuxtLink :to="destination" class="navbar-item group">
    <div v-if="collapsed" class="navbar-item-label-floating group-hover:block">
      {{ collapsedLabel || label }}
    </div>
    <slot name="icon">
      <div class="navbar-item-logo" />
    </slot>
    <div
      :class="[`navbar-item-label`, labelClass, {
        collapsedLabelClass: collapsed,
        'navbar-item-label-collapsed': collapsed,
        expandedLabelClass: !collapsed,
        'navbar-item-label-expanded': !collapsed,
      }]"
    >
      {{ label }}
    </div>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  destination: string
  collapsedLabel: string
  labelClass?: string
  collapsedLabelClass?: string
  collapsed?: boolean
  expandedLabelClass?: string
}>()
</script>
