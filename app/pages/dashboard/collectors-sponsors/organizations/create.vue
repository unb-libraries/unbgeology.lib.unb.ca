<template>
  <FormOrganization @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Organization } from "~/types/affiliate"
definePageMeta({
  name: `Add Organization`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:organization)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { create } = useEntityType<Organization>(`Term`)
const returnUrl = `/dashboard/collectors-sponsors/organizations`

async function onSave(values: Organization) {
  const { error } = await create(values)
  if (!error.value) {
    navigateTo(returnUrl)
  }
}

</script>
