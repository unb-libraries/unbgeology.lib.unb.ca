<template>
  <FormClassificationMineral @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Mineral as Classification, MineralFormData } from "~/types/classification"

definePageMeta({
  name: `Add Classification`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:classification(:mineral)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Classification, MineralFormData>(`Term`)
const returnUrl = `/dashboard/minerals`

async function onSave({ label, parent, type, composition }: MineralFormData) {
  await create({ label, parent, type, composition })
  navigateTo(returnUrl)
}

</script>
