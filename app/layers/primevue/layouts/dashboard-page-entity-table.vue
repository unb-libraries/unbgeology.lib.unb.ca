<template>
  <NuxtLayout name="dashboard-page">
    <template #actions>
      <NuxtLink v-for="[destination, label] in actions" :key="destination" :to="destination" class="form-action form-action-submit p-2 font-normal">
        {{ label }}
      </NuxtLink>
    </template>

    <div v-if="searchable" class="relative flex w-full flex-row space-x-2">
      <div class="form-field w-full">
        <label class="sr-only" for="search">Search</label>
        <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 form-input form-input-text grow p-2 placeholder:italic">
      </div>
    </div>

    <PvEntityTable :entities="entities" :columns="columns">
      <template v-for="id in columnIDs" #[id]="{ value, entity }">
        <slot :name="`column-${id}`" :value="value" :entity="entity">
          {{ value }}
        </slot>
      </template>
    </PvEntityTable>
  </NuxtLayout>
</template>

<script setup lang="ts">
const props = defineProps<{
  entityType: string
  bundle?: string
  actions:(string | [string, string])[]
  columns:(string | [string, string])[]
  searchable?: boolean
}>()

const actions = computed(() => props.actions.map(action => Array.isArray(action) ? action : [action, `${action.split(`/`).at(-1)} ${props.entityType}`]))
const columnIDs = computed(() => props.columns.map(column => Array.isArray(column) ? column[0] : column))
const { entities, query } = await fetchEntityList(props.entityType)
const { search } = query
</script>
