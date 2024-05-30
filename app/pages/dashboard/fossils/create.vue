<template>
  <FormClassificationFossil @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Fossil as Classification, FossilFormData } from "~/types/classification"

definePageMeta({
  name: `Add fossil`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:classification(:fossil)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Classification, FossilFormData>(`Term`)
const returnUrl = `/dashboard/fossils`

async function onSave({ label, parent, type, rank }: FossilFormData) {
  await create({ label, parent, type, rank })
  navigateTo(returnUrl)
}

</script>
