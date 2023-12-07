<template>
  <StorageLocationForm
    :term="term!"
    @save="onSave"
    @cancel="navigateTo(`/dashboard/taxonomies/storagelocation`)"
  />
</template>

<script setup lang="ts">
import { StorageLocation } from 'types/vocabularies'
import { EntityJSONBody } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { slug } = useRoute().params
const { fetchByPK, update } = useEntityType<StorageLocation>(`StorageLocation`)
const { entity: term } = await fetchByPK(slug as string)

if (!term.value) {
  showError({ statusCode: 404 })
}

async function onSave(storageLocation: EntityJSONBody<StorageLocation>) {
  await update(storageLocation)
  navigateTo(`/dashboard/taxonomies/storagelocation`)
}
</script>
