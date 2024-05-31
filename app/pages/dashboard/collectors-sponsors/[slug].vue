<template>
  <FormAffiliate :affiliate="affiliate!" :type="type" @save="o => onSave(o as unknown as Affiliate)" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Affiliate } from "~/types/affiliate"
definePageMeta({
  name: `Edit Collector / Sponsor`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:(organization|person))?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { slug } = useRoute().params
const { fetchBy } = useEntityType<Affiliate>(`Term`)

// REFACTOR Filter by "/^affiliation/(person|organization)$" instead; needs to be supported by API
const fetchByType = async (type: string) => await fetchBy({ slug: slug as string, type: `affiliate/${type}` })
let result = await fetchByType(`organization`)
if (!result) {
  result = await fetchByType(`person`)
  if (!result) {
    showError(`Collector/Sponsor not found`)
  }
}
const { entity: affiliate, update, error } = result

const type = computed(() => affiliate.value?.type.split(`/`)[1] as `person` | `organization`)
const returnUrl = `/dashboard/collectors-sponsors`

async function onSave(values: Affiliate) {
  await update(values)
  if (!error.value) {
    navigateTo(returnUrl)
  }
}

</script>
