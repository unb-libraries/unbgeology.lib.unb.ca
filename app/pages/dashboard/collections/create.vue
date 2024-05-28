<template>
  <TermForm type="collection" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Collection, CollectionCreateBody } from "~/types/collection"
definePageMeta({
  name: `Add Collection`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:collection)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Collection, CollectionCreateBody>(`Term`)
const returnUrl = `/dashboard/collections`

async function onSave({ label, type }: CollectionCreateBody) {
  await create({ label, type })
  navigateTo(returnUrl)
}

</script>
