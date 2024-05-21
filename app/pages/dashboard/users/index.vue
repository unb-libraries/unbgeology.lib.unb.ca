<template>
  <NuxtLayout name="dashboard-page">
    <div class="relative flex flex-row">
      <TwFormField label="Search" label-class="sr-only" class="w-full">
        <TwInputSearch v-model="search" class="w-full" />
      </TwFormField>
    </div>

    <div class="inline-flex w-full space-x-6">
      <div class="inline-flex grow justify-start space-x-2">
        <span v-if="sort.length" class="bg-yellow-dark rounded-sm px-2 py-1 text-sm">{{ sortableColumns.filter(([, [, sort]]) => sort).map(([, [label]]) => label).join(`,`) }}</span>
      </div>
      <div class="relative inline-flex justify-end space-x-2">
        <TableColumnsMenu :columns="toggleableColumns" @toggled="toggle" />
        <SortMenu :props="sortableColumns" @changed="(_, __, columns) => { sortableColumns = columns; sort = sortedByColumnIDs }" />
      </div>
    </div>

    <EntityTable
      v-model="users"
      :entities="entities"
      :columns="toggledColumns"
      class="w-full"
      :multi-select="true"
      row-class="last:border-primary-60/75 last:border-b even:dark:bg-primary-80/20 hover:bg-accent-dark/20 even:dark:hover:bg-accent-dark/20"
      selected-row-class="dark:bg-accent-dark/40 even:dark:bg-accent-dark/40 hover:dark:bg-accent-dark/60 even:hover:dark:bg-accent-dark/60"
    >
      <template #active="{ entity }">
        <span class="rounded-md px-2 py-1 text-sm" :class="{ 'bg-green-700': entity.active, 'bg-red-600': !entity.active }">
          {{ entity.active ? `Active` : `Blocked` }}</span>
      </template>
    </EntityTable>

    <div class=" flex w-full flex-row justify-between px-4">
      <span v-if="list?.total" class="italic">
        {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total ?? 0, page * pageSize) }} of {{ pluralize(list?.total ?? 0, `user`, `users`) }}
      </span>
      <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="pageSize" />
    </div>

    <template #sidebar>
      <div v-if="users.length > 0">
        {{ pluralize(users.length, `user`, `users`) }} selected
      </div>
      <span v-else>Nothing selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { FilterOperator, type User } from '@unb-libraries/nuxt-layer-entity'

definePageMeta({
  layout: false,
  name: `Users`,
})

const { selectedColumns, toggleableColumns, sortableColumns, sortedByColumnIDs, toggle } = useColumns([
  [`id`, `Username`],
  [`created`, { label: `Member since` }],
  `roles`,
  [`active`, { label: `Status` }],
])

const { list, entities, query, removeMany } = await fetchEntityList<User>(`User`, {
  select: [`id`, `active`, `roles`, `profile`, `created`, `updated`],
})
const { filter, page, pageSize, search, sort } = query
const users = ref([])

</script>
