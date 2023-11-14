<template>
  <StorageLocationForm
    :term="term!"
    @save="onSave"
    @cancel="navigateTo(cancelUrl)"
  />
</template>

<script setup lang="ts">
import { StorageLocation } from 'types/taxonomy'
import { type EntityJSONBody, type EntityJSONProperties } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const cancelUrl = `/dashboard/taxonomies/storagelocation`
const { create } = useEntityType<StorageLocation>(Symbol(`taxonomies`), `storagelocation`)
const term = ref({} as EntityJSONProperties<StorageLocation>)

if (!term.value) {
  showError({ statusCode: 404 })
}

async function onSave(storageLocation: EntityJSONBody<StorageLocation>) {
  await create(storageLocation)
  navigateTo(cancelUrl)
}
</script>
