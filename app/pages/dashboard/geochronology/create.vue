<template>
  <FormGeochronology @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Unit } from "~/types/geochronology"

definePageMeta({
  name: `Add unit`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:geochronology)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Unit>(`Term`)
const returnUrl = `/dashboard/geochronology`

async function onSave(unit: Unit) {
  // console.log(unit)
  const { error } = await create(unit)
  if (error.value) {
    console.log(error)
  } else {
    navigateTo(returnUrl)
  }
}

</script>
