<template>
  <FormStorageLocation @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { StorageLocation, StorageLocationPayload } from "~/types/storagelocation"

definePageMeta({
  name: `Add location`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:storagelocation)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<StorageLocation>(`Term`)
const returnUrl = `/dashboard/storage-locations`

async function onSave(data: StorageLocationPayload) {
  await create({ ...data, type: `storageLocation` })
  navigateTo(returnUrl)
}

</script>
