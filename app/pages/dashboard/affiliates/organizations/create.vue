<template>
  <FormOrganization :organization="organization" @save="onCreate" />
</template>

<script setup lang="ts">
import { type Address, type Organization } from 'types/affiliation'
import { type EntityJSONProperties, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
})

const organization = ref<EntityJSONProperties<Organization>>({
  name: ``,
  address: {} as Address,
})

function onCreate(organization: EntityJSONBody<Organization>) {
  const { create } = useEntityType<Organization>(`Organization`)
  create(organization)
  navigateTo(`/dashboard/affiliates/organizations`)
}
</script>
