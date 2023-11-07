<template>
  <FormOrganization v-if="organization" :organization="organization" @save="onUpdate" />
</template>

<script setup lang="ts">
import { type Organization } from 'types/affiliation'
import { type EntityJSONBody } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const { id } = useRoute().params
const { fetchByPK, update } = useEntityType<Organization>(Symbol(`affiliations`), `org`)
const { entity: organization } = await fetchByPK(id as string)

function onUpdate(organization: EntityJSONBody<Organization>) {
  update(organization)
  navigateTo(`/dashboard/affiliates/organizations`)
}
</script>
