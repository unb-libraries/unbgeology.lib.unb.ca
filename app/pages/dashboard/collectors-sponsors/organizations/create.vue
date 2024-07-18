<template>
  <FormAffiliateOrganization @save="onSave" @cancel="navigateTo(returnUrl)" />
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
const { createToast } = useToasts()
const returnUrl = useRoute().path.split(`/`).slice(0, -1).join(`/`)

async function onSave(values: Organization) {
  const { error } = await create({ ...values, type: `affiliate/organization` })
  if (!error.value) {
    createToast(`create-organization`, () => `Organization created`, { type: `success`, duration: 4000 })
    navigateTo(returnUrl)
  } else {
    createToast(`error-create-organization`, () => `${error.value}`, { type: `error`, duration: 4000 })
  }
}

</script>
