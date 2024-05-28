<template>
  <TermForm :entity="term!" type="collection" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Collection, CollectionCreateBody } from "~/types/collection"
const { slug } = useRoute().params

definePageMeta({
  name: `Edit Collection`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:collection)?/,
  },
  menu: {
    weight: 0,
  },
})

const { fetchBy } = useEntityType<Collection, CollectionCreateBody, Partial<CollectionCreateBody>>(`Term`)
const { entity: term, update } = await fetchBy({ slug: slug as string }, { select: [`label`] })
if (!term.value) {
  showError(`Collection not found`)
}
const returnUrl = `/dashboard/collections`

async function onSave({ label }: Partial<CollectionCreateBody>) {
  await update({ label })
  navigateTo(returnUrl)
}

</script>
