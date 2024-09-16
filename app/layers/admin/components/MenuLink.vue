<template>
  <NuxtLink>
    <SidebarItem :collapsed="collapsed" :label="label" :collapsed-label="collapsedLabel" :label-class="labelClass">
      <template #icon>
        <slot name="icon" />
      </template>
    </sidebaritem>
  </NuxtLink>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  collapsedLabel?: string
  labelClass?: string
  collapsedLabelClass?: string
  collapsed?: boolean
  expandedLabelClass?: string
}>()
</script>
