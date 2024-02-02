<template>
  <div class="mb-6 flex flex-row space-x-8">
    <h1 class="text-2xl">
      Specimens
    </h1>
    <div class="flex grow flex-row space-x-2 text-right">
      <input v-model="search" placeholder="Search" class="placeholder:text-primary dark:placeholder:text-primary-20 form-input form-input-text grow p-2 placeholder:italic">

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

  <EntityTable class="border-primary-60/75 w-full border-b" header-cell-class="group" row-class="even:dark:bg-primary-80/20 hover:bg-accent-dark/20 even:dark:hover:bg-accent-dark/20 dark:focus:bg-accent-dark/40" :entities="specimens" :columns="[[`id`, `ID`], `category`, `classification`, [`measurements`, `Dimensions`], [`pieces`, `Pieces (Partial)`]]">
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
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard`,
})

const { list, entities: specimens, query } = await fetchEntityList<Specimen>(`Specimen`)
const { search, page, pageSize } = query
</script>
