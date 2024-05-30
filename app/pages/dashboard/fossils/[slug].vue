<template>
  <FormClassificationFossil :classification="classification!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Fossil as Classification, FossilFormData } from "~/types/classification"

const { slug } = useRoute().params

definePageMeta({
  name: `Edit fossil`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^update:term(:classification(:fossil)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { fetchBy } = useEntityType<Classification, FossilFormData>(`Term`)
const { entity: classification, update } = await fetchBy({ slug: slug as string, type: `classification/fossil` }, { select: [`label`, `parent`, `rank`] })
if (!classification.value) {
  showError(`Fossil not found.`)
}

const returnUrl = `/dashboard/fossils`

async function onSave({ label, parent, type, rank }: Classification) {
  await update({ label, parent, type, rank })
  navigateTo(returnUrl)
}

</script>
