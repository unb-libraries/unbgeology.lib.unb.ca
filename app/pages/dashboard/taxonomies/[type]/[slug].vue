<template>
  <TaxonomyTermForm
    :term="term!"
    :type="(type as string)"
    @save="onSave"
    @cancel="navigateTo(`/dashboard/taxonomies/${type}`)"
  />
</template>

<script setup lang="ts">
import { type EntityJSONBody, type Taxonomy } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { type, slug } = useRoute().params
const { fetchByPK, update } = useEntityType<Taxonomy>(Symbol(`taxonomies`), type as string)
const { entity: term } = await fetchByPK(slug as string)

if (!term.value) {
  showError({ statusCode: 404 })
}

async function onSave(term: EntityJSONBody<Taxonomy>) {
  await update(term)
  navigateTo(`/dashboard/taxonomies/${type}`)
}
</script>
