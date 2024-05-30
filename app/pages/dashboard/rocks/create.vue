<template>
  <FormClassificationRock @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Rock as Classification, RockFormData } from "~/types/classification"

definePageMeta({
  name: `Add rock`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:classification(:rock)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Classification, RockFormData>(`Term`)
const returnUrl = `/dashboard/rocks`

async function onSave({ label, parent, type }: RockFormData) {
  await create({ label, parent, type })
  navigateTo(returnUrl)
}

</script>
