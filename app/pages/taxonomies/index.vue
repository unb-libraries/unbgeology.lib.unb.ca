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
    <div class="mx-3 flex grow flex-col">
      <PvTable :value="terms" :row-class="() => `group hover:bg-accent-light`">
        <PvTableColumn field="label" header="Label" />
        <PvTableColumn field="self">
          <template #body="{ data }">
            <div class="invisible flex flex-row justify-end group-hover:visible">
              <a :title="`Edit ${data.label}`" class="h-8 w-8 rounded-md p-1 hover:cursor-pointer hover:bg-yellow-400" @click.prevent="selectToEdit(data)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </a>
              <a :title="`Delete ${data.label}`" class="h-8 w-8 rounded-md p-1 hover:cursor-pointer hover:bg-red-500" @click.prevent="onDelete(data.self)">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </a>
            </div>
          </template>
        </PvTableColumn>
        <template #empty>
          No terms have been created yet.
        </template>
      </PvTable>
      <FormTaxonomyTerm
        v-if="current"
        :uri="current.self"
        :term="currentTerm"
        class="mt-6"
        @created="loadTerms(current)"
        @updated="loadTerms(current)"
      />
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
const currentTerm = ref()

watch(current, loadTerms, { immediate: true })

const onDelete = async function (uri: string) {
  await useFetch(uri, { method: `DELETE` })
  await loadTerms(current.value!)
}

const selectToEdit = function (term: Taxonomy) {
  currentTerm.value = term
}
</script>
