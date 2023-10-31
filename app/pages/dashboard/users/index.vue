<template>
  <PvEntityTable uri="/api/users" :columns="[[`id`, `Username`], [`created`, `Member since`], `updated`]">
    <template #updated="{ value, entity }">
      {{ entity.created !== value ? value : `never` }}
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})
</script>
