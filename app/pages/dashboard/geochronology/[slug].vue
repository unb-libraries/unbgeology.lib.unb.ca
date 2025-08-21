<template>
  <FormGeochronology :unit="unit!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import { Status, type Unit } from "~/types/geochronology"

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
const { hasPermission } = useCurrentUser()
const { entity: unit, update } = await fetchBy({ slug: slug as string, type: `geochronology` })
if (!unit.value) {
  showError(`Unit not found.`)
}

if (!hasPermission(new RegExp(`^update:term(:geochronology)?:${useEnum(Status).labelOf(unit.value!.status)}:`))) {
  showError({ status: 403, statusMessage: `You do not have permission to edit this unit.` })
}

const returnUrl = `/dashboard/geochronology`

async function onSave(unit: Unit) {
  await update(unit)
  navigateTo(returnUrl)
}

</script>
