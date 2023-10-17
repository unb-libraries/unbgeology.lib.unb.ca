<template>
  <PvEntityTable uri="/api/specimens" :columns="[`name`, `dimensions`, `age`, `pieces`, `partial`, `created`, `updated`, `status`]">
    <template #name="{ value, entity }">
      <NuxtLink :to="`/dashboard/${entity.self.substring(5)}`" class="hover:underline">
        {{ value }}
      </NuxtLink>
    </template>
    <template #dimensions="{ value }">
      {{ value.width }}mm x {{ value.length }}mm
    </template>
    <template #partial="{ value }">
      {{ value ? `Yes` : `No` }}
    </template>
    <template #status="{ value }">
      <span class="rounded-md p-2 text-xs font-bold uppercase" :class="{ 'bg-yellow': value === 'draft', 'bg-blue': value === 'review', 'bg-accent-dark': value === 'published' }">{{ value }}</span>
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})
</script>
