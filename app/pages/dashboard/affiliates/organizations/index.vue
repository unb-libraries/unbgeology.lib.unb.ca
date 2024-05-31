<template>
  <PvEntityTable :entities="organizations" :columns="[`label`, `address`]">
    <template #label="{ entity: org }">
      <NuxtLink :to="`/dashboard/affiliates/organizations/${org.id}`" class="hover:underline">
        {{ org.name }}
      </NuxtLink>
    </template>
    <template #address="{ value: address }">
      <div v-if="address">
        {{ address.line1 }}
        {{ address.line2 ? `, ${address.line2}` : `` }},
        {{ address.city }}
        {{ address.state ? `, ${address.state}` : `` }},
        {{ address.postalCode }},
        {{ address.country }}
      </div>
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { FilterOperator } from '@unb-libraries/nuxt-layer-entity'
import { type Organization } from 'types/affiliate'

definePageMeta({
  layout: `dashboard`,
  // name: `Organizations`,
})

const { entities: organizations } = await fetchEntityList<Organization>(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `organization`]] })
</script>
