<template>
  <FormAffiliateOrganization :organization="organization!" @save="onSave" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Organization } from "~/types/affiliate"
definePageMeta({
  name: `Edit organization`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:(organization))?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { slug } = useRoute().params
const { fetchBy } = useEntityType<Organization>(`Term`)

const { entity: organization, update, error } = await fetchBy({ slug: slug as string, type: `affiliate/organization` })
const { createToast } = useToasts()
const returnUrl = useRoute().path.split(`/`).slice(0, -1).join(`/`)

async function onSave(values: Organization) {
  await update(values)
  if (!error.value) {
    createToast(`update-organization`, () => `Organization updated`, { type: `success`, duration: 4000 })
    navigateTo(returnUrl)
  } else {
    createToast(`error-update-organization`, () => `${error.value}`, { type: `error`, duration: 4000 })
  }
}

</script>
