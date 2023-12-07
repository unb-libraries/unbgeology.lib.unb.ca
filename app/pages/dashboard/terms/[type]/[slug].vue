<template>
  <TaxonomyTermForm
    :term="term!"
    :type="(type as string)"
    @save="onSave"
    @cancel="navigateTo(`/dashboard/taxonomies/${type}`)"
  />
</template>

<script setup lang="ts">
import { type EntityJSONBody, type Term } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { type, slug } = useRoute().params
const entityTypeId = Object.keys(useAppConfig().entityTypes).find(key => key.toLowerCase() === type)
if (!entityTypeId) {
  showError({ statusCode: 404 })
}

const { fetchByPK } = useEntityType<Term>(entityTypeId!)
const { entity: term } = await fetchByPK(slug as string)
if (!term.value) {
  showError({ statusCode: 404 })
}

async function onSave(term: EntityJSONBody<Term>) {
  await updateEntity(term)
  navigateTo(`/dashboard/taxonomies/${type}`)
}
</script>
