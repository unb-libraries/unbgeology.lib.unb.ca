<template>
  <FormClassificationRock :classification="classification!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Rock as Classification, RockFormData } from "~/types/classification"

const { slug } = useRoute().params

definePageMeta({
  name: `Edit rock`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^update:term(:classification(:rock)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { fetchBy } = useEntityType<Classification, RockFormData>(`Term`)
const { entity: classification, update } = await fetchBy({ slug: slug as string, type: `classification/rock` }, { select: [`label`, `parent`, `description`, `image`] })
if (!classification.value) {
  showError(`Rock not found.`)
}

const returnUrl = `/dashboard/rocks`

async function onSave({ label, parent, description, image, type }: Classification) {
  await update({ label, parent, type, description, image })
  navigateTo(returnUrl)
}

</script>
