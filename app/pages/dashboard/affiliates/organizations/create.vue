<template>
  <FormOrganization :organization="organization" @save="onCreate" />
</template>

<script setup lang="ts">
import { type Address, type Organization } from 'types/affiliation'
import { EntityJSONProperties, type EntityJSONBody } from 'layers/base/types/entity'

definePageMeta({
  layout: `dashboard`,
})

const organization = ref<EntityJSONProperties<Organization>>({
  name: ``,
  address: {} as Address,
})

function onCreate(organization: EntityJSONBody<Organization>) {
  const { create } = useEntityType<Organization>(Symbol(`affiliations`), `org`)
  create(organization)
  navigateTo(`/dashboard/affiliates/organizations`)
}
</script>
