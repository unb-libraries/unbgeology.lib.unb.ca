<template>
  <PvEntityTable entity-type-id="Organization" :columns="[`name`, `address`]">
    <template #name="{ entity: org }">
      <NuxtLink :to="`/dashboard/affiliates/organizations/${org.id}`" class="hover:underline">
        {{ org.name }}
      </NuxtLink>
    </template>
    <template #address="{ value: address }">
      {{ address.address1 }}
      {{ address.address2 ? `, ${address.address2}` : `` }},
      {{ address.city }}
      {{ address.state ? `, ${address.state}` : `` }},
      {{ address.postalCode }},
      {{ address.country }}
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
definePageMeta({
  layout: `dashboard`,
})
</script>
