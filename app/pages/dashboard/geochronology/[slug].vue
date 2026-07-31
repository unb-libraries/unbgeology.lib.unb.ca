<template>
  <FormGeochronology :unit="unit!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import { Status, type Unit } from "~~/types/geochronology"

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

if (!usePermissions(new RegExp(`^update:term(:geochronology)?(:${useEnum(Status).labelOf(unit.value!.status)})?:(\\*|\\w)$`)).value.length) {
  showError({ status: 403, statusMessage: `You do not have permission to edit this unit.` })
}

const returnUrl = `/dashboard/geochronology`

async function onSave(unit: Unit) {
  await update(unit)
  navigateTo(returnUrl)
}

</script>
