<template>
  <header class="mb-6 space-y-6">
    <div class="flex flex-row space-x-8">
      <h1 id="title" class="text-2xl">
        Specimens
      </h1>
      <div class="grow space-x-2 text-right">
        <NuxtLink to="/dashboard/specimens/create/?category=fossil" class="form-action form-action-submit p-2 font-normal">
          Create Fossil
        </NuxtLink>
        <NuxtLink to="/dashboard/specimens/create/?category=mineral" class="form-action form-action-submit p-2 font-normal">
          Create Mineral
        </NuxtLink>
        <NuxtLink to="/dashboard/specimens/create/?category=rock" class="form-action form-action-submit p-2 font-normal">
          Create Rock
        </NuxtLink>
      </div>
    </div>

    <div class="relative flex w-full flex-row space-x-2">
      <div class="form-field w-full">
        <label class="sr-only" for="search">Search</label>
        <input v-model="search" placeholder="Search" name="search" class="placeholder:text-primary dark:placeholder:text-primary-20 form-input form-input-text grow p-2 placeholder:italic">
      </div>
    </div>
  </header>

  <EntityTable
    v-model="selected"
    class="border-primary-60/75 w-full border-b"
    header-cell-class="group"
    row-class="even:dark:bg-primary-80/20 hover:bg-accent-dark/20 even:dark:hover:bg-accent-dark/20"
    :entities="specimens"
    :columns="columns.filter(([id, label, selected]) => selected).map(([id, label]) => [id, label])"
    :multi-select="true"
    selected-row-class="dark:bg-accent-dark/40 even:dark:bg-accent-dark/40 hover:dark:bg-accent-dark/60 even:hover:dark:bg-accent-dark/60"
  >
    <template #id="{ entity: specimen }">
      <NuxtLink :to="`/dashboard/specimens/${specimen.id.toLowerCase()}`" class="hover:underline">
        {{ specimen.id.toUpperCase() }}
      </NuxtLink>
    </template>
    <template #category="{ entity: specimen }">
      {{ specimen.category.substring(0, 1).toUpperCase() + specimen.category.substring(1).toLowerCase() }}
    </template>
    <template #classification="{ entity: specimen }">
      <template v-if="specimen.classification">
        {{ specimen.classification.label }}
      </template>
    </template>
    <template #measurements="{ entity: specimen }">
      <ol v-if="specimen.measurements?.length">
        <li v-for="(dimensions, index) in specimen.measurements.map(m => m.dimensions)" :key="index">
          {{ dimensions.map(d => `${d / 10}cm`).join(` x `) }}
        </li>
      </ol>
      <span v-else />
    </template>
    <template #pieces="{ entity: specimen}">
      {{ specimen.pieces }}{{ specimen.partial ? ` (P)` : `` }}
    </template>
  </EntityTable>

  <div class="mt-2 flex flex-row justify-between">
    <span v-if="list?.total" class="italic">
      {{ (page - 1) * pageSize + 1 }} - {{ Math.min(list?.total, page * pageSize) }} of {{ pluralize(list?.total, `specimen`, `specimens`) }}
    </span>
    <PvPaginator v-model="page" :total="Math.ceil((list?.total ?? 0) / pageSize)" :size="5" />
  </div>
</template>

<script setup lang="ts">
import { type EntityJSON } from '@unb-libraries/nuxt-layer-entity'
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard`,
})

const { list, entities: specimens, query } = await fetchEntityList<Specimen>(`Specimen`)
const { search, page, pageSize } = query

const selected = ref<EntityJSON<Specimen>[]>([])
</script>
