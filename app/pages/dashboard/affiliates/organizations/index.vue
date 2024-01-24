<template>
  <PvEntityTable :entities="organizations" :columns="[`name`, `address`]">
    <template #name="{ entity: org }">
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
import { type Organization } from '~/types/affiliation'

definePageMeta({
  layout: `dashboard`,
})

const { entities: organizations } = await fetchEntityList<Organization>(`Organization`)
</script>
