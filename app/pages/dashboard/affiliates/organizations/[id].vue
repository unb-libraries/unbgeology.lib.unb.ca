<template>
  <FormOrganization v-if="organization" :organization="organization" @save="onUpdate" />
</template>

<script setup lang="ts">
import { type Organization } from 'types/affiliation'
import { type EntityJSONBody } from "@unb-libraries/nuxt-layer-entity"

definePageMeta({
  layout: `dashboard`,
})

const { id } = useRoute().params
const { fetchByPK, update } = useEntityType<Organization>(`Organization`)
const { entity: organization } = await fetchByPK(id as string)

function onUpdate(organization: EntityJSONBody<Organization>) {
  update(organization)
  navigateTo(`/dashboard/affiliates/organizations`)
}
</script>
