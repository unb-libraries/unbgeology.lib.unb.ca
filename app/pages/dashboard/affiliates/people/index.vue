<template>
  <PvEntityTable :entities="people" :columns="[`label`, `title`, `email`, `phone`]">
    <template #label="{ entity: person }">
      <NuxtLink :to="`/dashboard/affiliates/people/${person.id}`" class="hover:underline">
        {{ person.lastName }}, {{ person.firstName }}
      </NuxtLink>
    </template>
    <template #title="{ value: title }">
      <span v-if="title === String(Title.DR | Title.PROF)">Prof. Dr.</span>
      <span v-else-if="title === String(Title.DR)">Dr.</span>
      <span v-else-if="title === String(Title.PROF)">Prof.</span>
      <span v-else />
    </template>
  </PvEntityTable>
</template>

<script setup lang="ts">
import { FilterOperator } from "@unb-libraries/nuxt-layer-entity"
import { Title } from "types/affiliate"

definePageMeta({
  layout: `dashboard`,
  // name: `People`,
})

const { entities: people } = await fetchEntityList(`Term`, { filter: [[`type`, FilterOperator.EQUALS, `person`]] })
</script>
