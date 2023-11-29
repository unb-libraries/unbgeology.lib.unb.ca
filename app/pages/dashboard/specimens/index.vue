<template>
  <PvEntityTable uri="/api/specimens" :columns="[`name`, `measurements`, `age`, `pieces`, `partial`, `created`, `updated`, `status`]">
    <template #name="{ value, entity }">
      <NuxtLink :to="`/dashboard/${entity.self.substring(5)}`" class="hover:underline">
        {{ value }}
      </NuxtLink>
    </template>
    <template #measurements="{ value: measurements }">
      <ul v-for="dimensions in measurements" :key="dimensions">
        <li>{{ dimensions.width }}mm x {{ dimensions.length }}mm</li>
      </ul>
    </template>
    <template #age="{ value: age }">
      {{ age.numeric ? age.numeric : `${age.relative.boundaries.lower} - ${age.relative.boundaries.upper}` }} Ma ({{ age.relative.label }})
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
