<template>
  <FormAffiliateOrganization v-if="type === `organization`" :organization="(affiliate as Organization)" />
  <FormAffiliatePerson v-else-if="type === `person`" :person="(affiliate as Person)" />
</template>

<script setup lang="ts">
import type { Affiliate, Organization, Person } from "types/affiliate"

defineProps<{
  affiliate?: Affiliate
  type: `organization` | `person`
}>()

</script>
