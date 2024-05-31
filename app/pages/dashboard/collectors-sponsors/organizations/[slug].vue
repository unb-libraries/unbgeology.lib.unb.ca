<template>
  <FormOrganization :entity="organization!" @save="o => onSave(o as unknown as OrganizationFormData)" @cancel="navigateTo(returnUrl)" />
</template>

<script setup lang="ts">
import type { Organization } from "~/types/affiliate"
type OrganizationFormData = Omit<Organization, `web`> & { web?: string }

definePageMeta({
  name: `Edit Organization`,
  layout: `dashboard-page`,
  auth: {
    redirect: true,
    permission: /^create:term(:affiliate(:organization)?)?/,
  },
  menu: {
    weight: 0,
  },
})

const { slug } = useRoute().params
const { fetchBy } = useEntityType<Organization, OrganizationFormData>(`Term`)
const { entity: organization, update, error } = await fetchBy({ slug: slug as string, type: `affiliate/organization` }, { select: [`label`, `web`, `contact`, `address`] })
if (!organization.value) {
  throw new Error(`Organization not found`)
}

const returnUrl = `/dashboard/collectors-sponsors/organizations`

async function onSave({ web, ...values }: OrganizationFormData) {
  await update({
    ...values,
    web: (web && [web]) || undefined,
  })
  if (!error.value) {
    navigateTo(returnUrl)
  }
}

</script>
