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
        <span v-if="filter.length" class="bg-blue-dark rounded-sm px-2 py-1 text-sm">{{ Object.keys(modified).join(`,`) }}</span>
      </div>
      <div class="relative inline-flex justify-end space-x-2">
        <TableColumnsMenu :columns="toggleableColumns" @toggled="toggle" />
        <SortMenu :props="sortableColumns" @changed="(_, __, columns) => { sortableColumns = columns; sort = sortedByColumnIDs }" />
        <FilterMenu :filters="{ roles: { ...roles, label: `Role` }, active: { ...active, label: `Status` } }" @submit="onApplyFilters" @reset="onResetFilters">
          <template #roles>
            <PvInputDropdown v-model="roles.value" :options="[`sudo`, `sysadmin`, `migrator`, `curator`, `editor`, `public`]" class="w-full" />
          </template>
          <template #active>
            <PvInputDropdown v-model="active.value" :options="[`active`, `blocked`]" class="w-full" />
          </template>
        </FilterMenu>
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
      <EntityAdminSidebar v-if="users.length" :entities="users">
        <PvEntityDetails v-if="users.length === 1" :entity="users[0]" :fields="columns.values.map(({ id, label }) => [id, label])" class="space-y-4" label-class="font-bold italic">
          <template #active="{ value: status }">
            <span class="rounded-md px-2 py-1 text-sm" :class="{ 'bg-green-700': status, 'bg-red-600': !status }">
              {{ status ? `Active` : `Blocked` }}
            </span>
          </template>
          <template #profile="{ value: profile }">
            {{ profile.firstName }}
          </template>
          <template #roles>
            <ul>
              <li v-for="role in users[0].roles" :key="role">
                {{ role[0].toUpperCase() + role.slice(1).toLowerCase() }}
              </li>
            </ul>
          </template>
        </PvEntityDetails>
        <template #actions>
          <div class="space-y-2">
            <button v-if="hasPermission(/^update:user/)" class="button button-lg button-outline-yellow-light hover:button-yellow-light hover:text-primary w-full">
              Edit{{ users.length > 1 ? ` ${users.length} users` : `` }}
            </button>
            <button v-if="hasPermission(/^delete:user/)" class="button button-lg button-outline-red-dark hover:button-red-dark w-full" @click.stop.prevent="onRemove">
              Delete{{ users.length > 1 ? ` ${users.length} users` : `` }}
            </button>
          </div>
        </template>
      </EntityAdminSidebar>
      <span v-else>No user selected.</span>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { FilterOperator, type EntityJSON, type User } from '@unb-libraries/nuxt-layer-entity'

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

const users = ref<EntityJSON<User>[]>([])

const { filters: { roles, active }, modified, reset } = useFilter({
  roles: FilterOperator.EQUALS,
  active: FilterOperator.EQUALS,
})

const onApplyFilters = () => {
  filter.value = Object.entries(modified.value)
    .map(([key, { op, value }]) => [key, op, value])
    .map(([key, op, value]) => key === `active`
      ? [key, op, value === `active`]
      : [key, op, value])
}

const onResetFilters = () => {
  reset()
  filter.value = []
}

const onRemove = async () => {
  await removeMany(users.value)
  users.value = []
}
</script>
