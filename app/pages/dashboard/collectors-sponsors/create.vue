<template>
  <FormAffiliate :type="affiliateType" @save="o => onSave(o as unknown as Affiliate)" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Affiliate } from "~/types/affiliate"
definePageMeta({
  name: `Add Collector / Sponsor`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:(person|organization))?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { type } = useRoute().query
const affiliateType = type === `organization` ? `organization` : `person`

const { create } = useEntityType<Affiliate>(`Term`)
const returnUrl = `/dashboard/collectors-sponsors`

async function onSave(values: Affiliate) {
  const { error } = await create(values)
  if (!error.value) {
    navigateTo(returnUrl)
  }
}

</script>
