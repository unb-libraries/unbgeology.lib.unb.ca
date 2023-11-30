<template>
  <TaxonomyTermForm
    :term="term"
    :type="(type as string)"
    @save="onSave"
    @cancel="navigateTo(`/dashboard/taxonomies/${type}`)"
  />
</template>

<script setup lang="ts">
import { type EntityJSONBody, type EntityJSONProperties, type Taxonomy } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { type } = useRoute().params
const { create } = useEntityType<Taxonomy>(Symbol(`taxonomies`), type as string)
const term = ref({} as EntityJSONProperties<Taxonomy>)

async function onSave(term: EntityJSONBody<Taxonomy>) {
  await create(term)
  navigateTo(`/dashboard/taxonomies/${type}`)
}
</script>
