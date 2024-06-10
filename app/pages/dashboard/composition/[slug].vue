<template>
  <TermForm :entity="term!" type="composition/fossil" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Composition, CompositionCreateBody } from "~/types/composition"
const { slug } = useRoute().params

definePageMeta({
  name: `Edit Composition`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:composition)?/,
  },
  menu: {
    weight: 0,
  },
})

const { fetchBy } = useEntityType<Composition, CompositionCreateBody, Partial<CompositionCreateBody>>(`Term`)
const { entity: term, update } = await fetchBy({ slug: slug as string })
if (!term.value) {
  showError(`Term not found`)
}
const returnUrl = `/dashboard/composition`

async function onSave({ label }: Partial<CompositionCreateBody>) {
  await update({ label })
  navigateTo(returnUrl)
}

</script>
