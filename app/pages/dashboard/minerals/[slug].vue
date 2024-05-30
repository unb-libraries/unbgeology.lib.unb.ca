<template>
  <FormClassificationMineral :classification="classification!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Mineral as Classification, MineralFormData } from "~/types/classification"

const { slug } = useRoute().params

definePageMeta({
  name: `Edit Classification`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^update:term(:classification(:mineral)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { fetchBy } = useEntityType<Classification, MineralFormData>(`Term`)
const { entity: classification, update } = await fetchBy({ slug: slug as string, type: `classification/mineral` }, { select: [`label`, `parent`, `composition`] })
if (!classification.value) {
  showError(`Fossil not found.`)
}

const returnUrl = `/dashboard/minerals`

async function onSave({ label, parent, type, composition }: Classification) {
  await update({ label, parent, type, composition })
  navigateTo(returnUrl)
}

</script>
