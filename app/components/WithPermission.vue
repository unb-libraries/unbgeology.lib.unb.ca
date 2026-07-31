<template>
  <slot v-if="hasPermission" />
  <slot v-else name="no-permission" />
</template>

<script lang="ts" setup>
const props = defineProps<{
  permission: string | string[] | RegExp | RegExp[]
}>()

const hasPermission = computed(() => 
  usePermissions(props.permission).value.length > 0)
</script>