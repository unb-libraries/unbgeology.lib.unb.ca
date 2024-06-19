<template>
  <FormGeochronology :unit="unit!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Unit } from "~/types/geochronology"

const { slug } = useRoute().params

definePageMeta({
  name: `Edit unit`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^update:term(:geochronology)?/,
  },
  menu: {
    weight: 0,
  },
})

const { fetchBy } = useEntityType<Unit>(`Term`)
const { entity: unit, update } = await fetchBy({ slug: slug as string, type: `geochronology` })
if (!unit.value) {
  showError(`Unit not found.`)
}

const returnUrl = `/dashboard/geochronology`

async function onSave(unit: Unit) {
  await update(unit)
  navigateTo(returnUrl)
}

</script>
