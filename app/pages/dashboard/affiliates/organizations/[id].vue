<template>
  <FormOrganization v-if="organization" :entity="organization" @save="onUpdate" @cancel="navigateTo(`/dashboard/affiliates/organizations`)" />
</template>

<script setup lang="ts">
import { type Organization } from 'types/affiliate'
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
