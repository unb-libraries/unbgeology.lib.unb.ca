<template>
  <FormStorageLocation :storage-location="storageLocation!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { StorageLocation, StorageLocationPayload } from "~/types/storagelocation"

definePageMeta({
  name: `Edit location`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:storagelocation)?/,
  },
  menu: {
    weight: 0,
  },
})

const { slug } = useRoute().params
const { fetchBy } = useEntityType<StorageLocation>(`Term`)
const { entity: storageLocation, update } = await fetchBy({ slug: slug as string, type: `storageLocation` })
if (!storageLocation.value) {
  showError(`Location not found.`)
}

const returnUrl = `/dashboard/storage-locations`

async function onSave(data: StorageLocationPayload) {
  await update({ ...data, type: `storageLocation` })
  navigateTo(returnUrl)
}

</script>
