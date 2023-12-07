<template>
  <TaxonomyTermForm
    :term="term"
    :type="(type as string)"
    @save="onSave"
    @cancel="navigateTo(`/dashboard/taxonomies/${type}`)"
  />
</template>

<script setup lang="ts">
import { type EntityJSONBody, type EntityJSONProperties, type Term } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { type } = useRoute().params
const entityTypeId = Object.keys(useAppConfig().entityTypes).find(key => key.toLowerCase() === type)
if (!entityTypeId) {
  showError({ statusCode: 404 })
}

const { create } = useEntityType<Term>(entityTypeId!)
const term = ref({} as EntityJSONProperties<Term>)

async function onSave(term: EntityJSONBody<Term>) {
  await create(term)
  navigateTo(`/dashboard/taxonomies/${type}`)
}
</script>
