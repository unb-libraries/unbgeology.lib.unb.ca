<template>
  <div class="flex flex-row space-x-8">
    <h1 class="mb-6 text-2xl">
      Specimens
    </h1>
    <div class="mb-6 flex grow flex-row space-x-2 text-right">
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
  <PvEntityTable :entities="specimens" :columns="[[`id`, `ID`], `category`, `classification`, `measurements`, `age`, `portion`, `pieces`, `partial`]">
    <template #id="{ value: id }">
      <NuxtLink :to="`/dashboard/specimens/${id.toLowerCase()}`" class="hover:underline">
        {{ id }}
      </NuxtLink>
    </template>
    <template #category="{ value: category }">
      {{ category.substring(0, 1).toUpperCase() + category.substring(1).toLowerCase() }}
    </template>
    <template #classification="{ value: classification }">
      <span v-if="classification">{{ classification.label }}</span>
    </template>
    <template #measurements="{ value: measurements }">
      <template v-if="Array.isArray(measurements) && measurements.length > 0">
        <ul v-for="dimensions in measurements" :key="dimensions">
          <li>{{ dimensions.width }}mm x {{ dimensions.length }}mm</li>
        </ul>
      </template>
      <span v-else />
    </template>
    <template #age="{ value: age }">
      <span v-if="age && age.numeric">
        {{ age.numeric }} Ma
      </span>
      <span v-if="age">
        {{ age.relative.boundaries.lower }} - {{ age.relative.boundaries.upper }} Ma ({{ age.relative.label }})
      </span>
    </template>
    <template #portion="{ value: portion }">
      <span v-if="portion">{{ portion.label }}</span>
    </template>
    <template #partial="{ value: partial }">
      <span v-if="partial">
        {{ partial ? `Yes` : `No` }}
      </span>
      <span v-else />
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { type Specimen } from 'types/specimen'

definePageMeta({
  layout: `dashboard`,
})

const { entities: specimens, query } = await fetchEntityList<Specimen>(`Specimen`)
const { search } = query
</script>
