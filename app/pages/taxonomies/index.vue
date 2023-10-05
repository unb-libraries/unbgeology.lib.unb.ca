<template>
  <div class="flex flex-row">
    <nav class="mr-1 flex list-none flex-col text-right">
      <li
        v-for="taxonomy in taxonomies"
        :key="taxonomy.self"
        class="cursor-pointer p-3 pl-12"
        :class="{ 'bg-accent-mid': taxonomy === current }"
        @click="e => current = taxonomy"
      >
        {{ taxonomy.name }}
      </li>
    </nav>
    <div class="flex grow flex-col">
      <PvTable :value="terms" :rowClass="() => `group hover:bg-accent-light`">
        <PvTableColumn field="label" header="Label" />
        <template #empty>
          No terms have been created yet.
        </template>
      </PvTable>
      <FormTaxonomyTerm v-if="current" :uri="current.self" class="mt-6" @created="onCreated" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Taxonomy } from '~/layers/mongo/types/taxonomy'

definePageMeta({
  layout: `page`,
  name: `Taxonomies`,
})

const loadTerms = async function (taxonomy: { self: string, name: string }) {
  const { data } = await useFetch<{ items: Taxonomy[] }>(taxonomy.self)
  terms.value = data.value?.items ?? []
}

const { data: taxonomies } = await useFetch(`/api/taxonomies`)
const current = ref(taxonomies.value?.at(0))
const terms = ref<Taxonomy[]>([])
watch(current, loadTerms, { immediate: true })

const onCreated = async function () {
  await loadTerms(current.value!)
}
</script>
