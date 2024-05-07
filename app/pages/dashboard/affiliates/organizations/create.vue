<template>
  <FormOrganization :organization="organization" @save="onCreate" />
</template>

<script setup lang="ts">
import { type Organization } from 'types/affiliate'
import { type EntityJSONProperties, type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
  name: `Create organization`,
})

const organization = ref<EntityJSONProperties<Organization>>({
  label: ``,
  address: {} as Organization[`address`],
})

function onCreate(organization: EntityJSONBody<Organization>) {
  const { create } = useEntityType<Organization>(`Organization`)
  create(organization)
  navigateTo(`/dashboard/affiliates/organizations`)
}
</script>
